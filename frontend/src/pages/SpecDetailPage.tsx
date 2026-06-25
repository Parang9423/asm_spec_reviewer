import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSpecStore } from '../stores/specStore';
import type { CompareResultDetail, GeneralSpec, GeneralSpecCondition, ReviewRecord, UnavailableCondition } from '../types/domain';

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
    <section className="page">
      <h1>{selectedSpec.aiCode} / {selectedSpec.defectName}</h1>
      <div className="two-column">
        <div className="card">
          <h2>AI Spec</h2>
          <pre>{selectedSpec.aiSpecText}</pre>
          <p>{selectedSpec.remark}</p>
        </div>
        <div className="card">
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
          <button onClick={saveGeneralSpec}>Save General Spec</button>
          <button onClick={compare}>Compare</button>
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
