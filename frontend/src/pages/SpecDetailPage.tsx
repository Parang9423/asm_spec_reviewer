import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSpecStore } from '../stores/specStore';
import type { CompareResultDetail, GeneralSpec, GeneralSpecCondition, ReviewRecord, SpecRow, UnavailableCondition } from '../types/domain';

const API_BASE = 'http://localhost:8000/api';

function emptyGeneralSpec(aiCode: string): GeneralSpec {
  return {
    aiCode,
    side: '',
    unitDummy: '',
    area: '',
    defectName: '',
    rawText: '',
    structuredConditions: [],
    unavailableConditions: [],
  };
}

function DetailSummary({ spec }: { spec: SpecRow }) {
  return (
    <div className="detail-summary-grid">
      <div className="card"><b>AI Code</b><span>{spec.aiCode}</span></div>
      <div className="card"><b>Defect</b><span>{spec.defectName}</span></div>
      <div className="card"><b>Area</b><span>{spec.area || '-'}</span></div>
      <div className="card"><b>Side</b><span>{spec.side || '-'}</span></div>
      <div className="card"><b>Unit/Dummy</b><span>{spec.unitDummy || '-'}</span></div>
      <div className="card"><b>Status</b><span>{spec.reviewStatus}</span></div>
    </div>
  );
}

function AiSpecConditionTable({ spec }: { spec: SpecRow }) {
  return (
    <div className="table-scroll">
      <table className="condition-table">
        <colgroup>
          <col className="cond-measure" />
          <col className="cond-op" />
          <col className="cond-value" />
          <col className="cond-unit" />
          <col className="cond-machine" />
          <col className="cond-default" />
          <col className="cond-none" />
        </colgroup>
        <thead>
          <tr>
            <th>Measurement</th>
            <th>Op</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Machine</th>
            <th>Default</th>
            <th>No Measurement</th>
          </tr>
        </thead>
        <tbody>
          {spec.conditions.length === 0 ? (
            <tr><td colSpan={7} className="muted">No AI Spec conditions.</td></tr>
          ) : (
            spec.conditions.map((condition, index) => (
              <tr key={`${condition.measurementName}-${condition.operator}-${condition.value}-${index}`}>
                <td className="strong-cell">{condition.measurementName}</td>
                <td>{condition.operator}</td>
                <td>{condition.value}</td>
                <td>{condition.unit}</td>
                <td>{condition.machineType}</td>
                <td>{condition.defaultResultValue}</td>
                <td>{condition.noMeasurementDefaultResult}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function SpecDetailPage() {
  const { aiCode = '' } = useParams();
  const { selectedSpec, fetchSpec } = useSpecStore();
  const [generalSpec, setGeneralSpec] = useState<GeneralSpec>(emptyGeneralSpec(aiCode));
  const [compareResult, setCompareResult] = useState<CompareResultDetail | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (!aiCode) return;
    fetchSpec(aiCode);
    fetch(`${API_BASE}/general-specs/${aiCode}`)
      .then((response) => (response.ok ? response.json() : emptyGeneralSpec(aiCode)))
      .then(setGeneralSpec);
  }, [aiCode, fetchSpec]);

  useEffect(() => {
    if (!selectedSpec) return;
    setGeneralSpec((prev) => ({
      ...prev,
      aiCode: selectedSpec.aiCode,
      side: selectedSpec.side,
      unitDummy: selectedSpec.unitDummy,
      area: selectedSpec.area,
      defectName: selectedSpec.defectName,
    }));
  }, [selectedSpec]);

  const addCondition = () => {
    const condition: GeneralSpecCondition = {
      metric: 'longest',
      operator: 'gte',
      value: 0,
      unit: 'MicroMeter',
      judgement: 'NG',
      compareAvailable: true,
    };
    setGeneralSpec((prev) => ({ ...prev, structuredConditions: [...prev.structuredConditions, condition] }));
  };

  const addUnavailable = () => {
    const item: UnavailableCondition = { text: '', reason: '', category: 'OTHER' };
    setGeneralSpec((prev) => ({ ...prev, unavailableConditions: [...prev.unavailableConditions, item] }));
  };

  const saveGeneralSpec = async () => {
    const response = await fetch(`${API_BASE}/general-specs/${aiCode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generalSpec),
    });
    const data = await response.json();
    setGeneralSpec(data);
  };

  const compare = async () => {
    const response = await fetch(`${API_BASE}/compare/${aiCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generalSpec),
    });
    setCompareResult(await response.json());
  };

  const saveReview = async () => {
    if (!selectedSpec) return;
    const payload: ReviewRecord = {
      aiCode: selectedSpec.aiCode,
      side: selectedSpec.side,
      unitDummy: selectedSpec.unitDummy,
      area: selectedSpec.area,
      defectName: selectedSpec.defectName,
      currentAiSpecText: selectedSpec.aiSpecText,
      generalSpecText: generalSpec.rawText,
      autoCompareResult: compareResult?.result ?? 'NOT_REVIEWED',
      autoCompareSummary: compareResult?.summary ?? '',
      reviewerDecision: reviewNote,
      aiTeamProposal: '',
      department: '',
      firstDiscussionResult: '',
      finalResult: '',
      status: 'IN_REVIEW',
      createdBy: 'AI_TEAM',
    };
    await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setReviewNote('');
  };

  if (!selectedSpec) return <section className="page"><p>Loading...</p></section>;

  return (
    <section className="page spec-detail-page">
      <div className="detail-header">
        <div>
          <Link className="back-link" to="/specs">Back to Spec List</Link>
          <h1>{selectedSpec.aiCode} / {selectedSpec.defectName}</h1>
          <p className="muted">Review current AI Spec against General Spec and record discussion history.</p>
        </div>
      </div>

      <DetailSummary spec={selectedSpec} />

      <div className="detail-grid">
        <div className="card stack detail-card-main">
          <div className="section-title-row">
            <h2>Current AI Spec</h2>
            <span className="pill">{selectedSpec.conditions.length} conditions</span>
          </div>
          {selectedSpec.remark && (
            <div className="remark-box"><b>Remark</b><p>{selectedSpec.remark}</p></div>
          )}
          <h3>Condition Table</h3>
          <AiSpecConditionTable spec={selectedSpec} />
          <h3>Raw Spec Text</h3>
          <pre>{selectedSpec.aiSpecText}</pre>
        </div>

        <div className="card stack detail-card-side">
          <h2>General Spec</h2>
          <textarea value={generalSpec.rawText} onChange={(e) => setGeneralSpec({ ...generalSpec, rawText: e.target.value })} />
          <h3>Structured Conditions</h3>
          <button onClick={addCondition}>Add condition</button>
          {generalSpec.structuredConditions.map((condition, index) => (
            <div className="condition-row" key={index}>
              <input value={condition.metric} onChange={(e) => {
                const next = [...generalSpec.structuredConditions]; next[index] = { ...condition, metric: e.target.value }; setGeneralSpec({ ...generalSpec, structuredConditions: next });
              }} />
              <input value={condition.operator} onChange={(e) => {
                const next = [...generalSpec.structuredConditions]; next[index] = { ...condition, operator: e.target.value }; setGeneralSpec({ ...generalSpec, structuredConditions: next });
              }} />
              <input value={condition.value} onChange={(e) => {
                const next = [...generalSpec.structuredConditions]; next[index] = { ...condition, value: e.target.value }; setGeneralSpec({ ...generalSpec, structuredConditions: next });
              }} />
              <input value={condition.unit} onChange={(e) => {
                const next = [...generalSpec.structuredConditions]; next[index] = { ...condition, unit: e.target.value }; setGeneralSpec({ ...generalSpec, structuredConditions: next });
              }} />
            </div>
          ))}
          <h3>Unavailable Conditions</h3>
          <button onClick={addUnavailable}>Add unavailable</button>
          {generalSpec.unavailableConditions.map((item, index) => (
            <div className="condition-row" key={index}>
              <input placeholder="condition" value={item.text} onChange={(e) => {
                const next = [...generalSpec.unavailableConditions]; next[index] = { ...item, text: e.target.value }; setGeneralSpec({ ...generalSpec, unavailableConditions: next });
              }} />
              <input placeholder="reason" value={item.reason} onChange={(e) => {
                const next = [...generalSpec.unavailableConditions]; next[index] = { ...item, reason: e.target.value }; setGeneralSpec({ ...generalSpec, unavailableConditions: next });
              }} />
            </div>
          ))}
          <div className="button-row"><button onClick={saveGeneralSpec}>Save General Spec</button><button onClick={compare}>Compare</button></div>
        </div>
      </div>

      <div className="card">
        <h2>Compare Result</h2>
        <b>{compareResult?.result ?? 'NOT_REVIEWED'}</b>
        <p>{compareResult?.summary}</p>
      </div>
      <div className="card">
        <h2>Review</h2>
        <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Decision or discussion note" />
        <button onClick={saveReview}>Save Review</button>
      </div>
    </section>
  );
}
