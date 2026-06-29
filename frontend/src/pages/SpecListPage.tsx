import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpecStore } from '../stores/specStore';
import type { CompareResult, GeneralSpec, ReviewRecord, SpecRow } from '../types/domain';

type ReviewDraft = {
  generalSpecText: string;
  compareResult: CompareResult;
  note: string;
  aiTeamProposal: string;
  proposalDetail: string;
  department: string;
  firstDiscussionResult: string;
  secondDiscussionResult: string;
  finalResult: string;
};

const compareOptions: CompareResult[] = ['NOT_REVIEWED', 'STRICTER', 'LOOSER', 'SAME', 'PARTIAL', 'NOT_COMPARABLE'];
const API_BASE = '/api';

function createDraft(): ReviewDraft {
  return {
    generalSpecText: '',
    compareResult: 'NOT_REVIEWED',
    note: '',
    aiTeamProposal: '',
    proposalDetail: '',
    department: '',
    firstDiscussionResult: '',
    secondDiscussionResult: '',
    finalResult: '',
  };
}

function rowKey(spec: SpecRow) {
  return [spec.aiCode, spec.side, spec.unitDummy, spec.area].join('|');
}

function buildGeneralSpec(spec: SpecRow, draft: ReviewDraft): GeneralSpec {
  return {
    aiCode: spec.aiCode,
    side: spec.side,
    unitDummy: spec.unitDummy,
    area: spec.area,
    defectName: spec.defectName,
    rawText: draft.generalSpecText,
    structuredConditions: [],
    unavailableConditions: [],
  };
}

function buildReviewRecord(spec: SpecRow, draft: ReviewDraft): ReviewRecord {
  return {
    aiCode: spec.aiCode,
    side: spec.side,
    unitDummy: spec.unitDummy,
    area: spec.area,
    defectName: spec.defectName,
    currentAiSpecText: spec.aiSpecText,
    generalSpecText: draft.generalSpecText,
    autoCompareResult: draft.compareResult,
    autoCompareSummary: draft.note,
    reviewerDecision: draft.note,
    aiTeamProposal: draft.aiTeamProposal,
    department: draft.department,
    firstDiscussionResult: draft.firstDiscussionResult,
    secondDiscussionResult: draft.secondDiscussionResult,
    finalResult: draft.finalResult || draft.proposalDetail,
    status: draft.finalResult ? 'FINALIZED' : 'IN_REVIEW',
    createdBy: 'AI_TEAM',
  };
}

export function SpecListPage() {
  const specs = useSpecStore((state) => state.specs);
  const summary = useSpecStore((state) => state.summary);
  const uploadSpec = useSpecStore((state) => state.uploadSpec);
  const loadSpecs = useSpecStore((state) => state.loadSpecs);
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (specs.length === 0) void loadSpecs();
  }, [loadSpecs, specs.length]);

  function getDraft(spec: SpecRow) {
    return drafts[rowKey(spec)] ?? createDraft();
  }

  function updateDraft(spec: SpecRow, patch: Partial<ReviewDraft>) {
    const key = rowKey(spec);
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? createDraft()), ...patch },
    }));
  }

  async function saveRow(spec: SpecRow) {
    const key = rowKey(spec);
    const draft = getDraft(spec);
    setSavingKey(key);
    try {
      await fetch(API_BASE + '/general-specs/' + spec.aiCode, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildGeneralSpec(spec, draft)),
      });
      await fetch(API_BASE + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildReviewRecord(spec, draft)),
      });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <section className="page spec-list-page">
      <header className="page-header">
        <div>
          <h1>Spec Review Grid</h1>
          <p>Review AI RMS Spec against General Spec in a spreadsheet-like layout.</p>
        </div>
        <label className="upload-button">
          Upload RMS JSON
          <input
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadSpec(file);
            }}
          />
        </label>
      </header>

      <div className="summary-grid">
        <div className="card"><b>Customer</b><span>{summary?.customer || '-'}</span></div>
        <div className="card"><b>Category</b><span>{summary?.category3 || '-'}</span></div>
        <div className="card"><b>RMS Rev</b><span>{summary?.rmsRev ?? '-'}</span></div>
        <div className="card"><b>Defects</b><span>{summary?.defectCount ?? specs.length}</span></div>
      </div>

      <div className="table-toolbar">
        <span>{specs.length.toLocaleString()} spec rows</span>
        <span className="muted">General Spec and discussion columns are editable per row.</span>
      </div>

      <div className="table-card review-grid-card">
        <div className="table-scroll">
          <table className="review-grid-table">
            <thead>
              <tr>
                <th>AI Code</th>
                <th>Side</th>
                <th>Unit/Dummy</th>
                <th>Area</th>
                <th>DefectName</th>
                <th>MachineType</th>
                <th>Defect Name MES</th>
                <th>General Spec</th>
                <th>AI RMS Spec</th>
                <th>Spec Compare</th>
                <th>Note</th>
                <th>AI Team Proposal</th>
                <th>Proposal Detail</th>
                <th>Department</th>
                <th>1st Discussion</th>
                <th>2nd Discussion</th>
                <th>Final</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((spec) => {
                const draft = getDraft(spec);
                const key = rowKey(spec);
                const machineType = spec.conditions[0]?.machineType ?? 'None';
                return (
                  <tr key={key}>
                    <td className="code-cell"><Link to={'/specs/' + spec.aiCode}>{spec.aiCode}</Link></td>
                    <td>{spec.side}</td>
                    <td>{spec.unitDummy}</td>
                    <td>{spec.area}</td>
                    <td>{spec.defectName}</td>
                    <td>{machineType}</td>
                    <td><input className="grid-input" placeholder="MES name" /></td>
                    <td><textarea className="grid-textarea" value={draft.generalSpecText} onChange={(event) => updateDraft(spec, { generalSpecText: event.target.value })} /></td>
                    <td><pre className="grid-spec-text">{spec.aiSpecText}</pre></td>
                    <td>
                      <select className="grid-select" value={draft.compareResult} onChange={(event) => updateDraft(spec, { compareResult: event.target.value as CompareResult })}>
                        {compareOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </td>
                    <td><textarea className="grid-textarea small" value={draft.note} onChange={(event) => updateDraft(spec, { note: event.target.value })} /></td>
                    <td><input className="grid-input" value={draft.aiTeamProposal} onChange={(event) => updateDraft(spec, { aiTeamProposal: event.target.value })} /></td>
                    <td><textarea className="grid-textarea small" value={draft.proposalDetail} onChange={(event) => updateDraft(spec, { proposalDetail: event.target.value })} /></td>
                    <td><input className="grid-input" value={draft.department} onChange={(event) => updateDraft(spec, { department: event.target.value })} /></td>
                    <td><textarea className="grid-textarea small" value={draft.firstDiscussionResult} onChange={(event) => updateDraft(spec, { firstDiscussionResult: event.target.value })} /></td>
                    <td><textarea className="grid-textarea small" value={draft.secondDiscussionResult} onChange={(event) => updateDraft(spec, { secondDiscussionResult: event.target.value })} /></td>
                    <td><input className="grid-input" value={draft.finalResult} onChange={(event) => updateDraft(spec, { finalResult: event.target.value })} /></td>
                    <td className="action-cell">
                      <button type="button" onClick={() => void saveRow(spec)} disabled={savingKey === key}>{savingKey === key ? 'Saving' : 'Save'}</button>
                      <Link className="detail-link" to={'/specs/' + spec.aiCode}>Detail</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
