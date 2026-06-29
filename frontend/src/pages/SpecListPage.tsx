import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpecStore } from '../stores/specStore';
import type { CompareResult, GeneralSpec, ReviewRecord, SpecRow } from '../types/domain';

type ReviewDraft = {
  defectNameMes: string;
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

type ReviewTab = 'proposal' | 'discussion' | 'final';

const compareOptions: CompareResult[] = ['NOT_REVIEWED', 'STRICTER', 'LOOSER', 'SAME', 'PARTIAL', 'NOT_COMPARABLE'];
const compareLabels: Record<CompareResult, string> = {
  NOT_REVIEWED: '미검토',
  STRICTER: '강화',
  LOOSER: '완화',
  SAME: '동일',
  PARTIAL: '부분 적용',
  NOT_COMPARABLE: '비교 불가',
};
const API_BASE = '/api';

function createDraft(): ReviewDraft {
  return {
    defectNameMes: '',
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

function formatAiRmsSpecText(value: string) {
  return value
    .replace(/\bOK\b/g, '양품 조건')
    .replace(/\bNG\b/g, '불량 조건')
    .replace(/\bUnknown\b/g, '판정불가 조건')
    .replace(/\bAI_OK\b/g, '양품 조건')
    .replace(/\bAI_NG\b/g, '불량 조건')
    .replace(/\bAI_UNKNOWN\b/g, '판정불가 조건')
    .replace(/\bAI_UNKNOWN_NONE\b/g, '판정불가 조건');
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

function selectedRowLabel(spec: SpecRow | null) {
  if (!spec) return '선택된 스펙 없음';
  return `${spec.aiCode} / ${spec.defectName} / ${spec.side} / ${spec.unitDummy} / ${spec.area}`;
}

export function SpecListPage() {
  const specs = useSpecStore((state) => state.specs);
  const summary = useSpecStore((state) => state.summary);
  const uploadSpec = useSpecStore((state) => state.uploadSpec);
  const loadSpecs = useSpecStore((state) => state.loadSpecs);
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReviewTab>('proposal');

  useEffect(() => {
    if (specs.length === 0) void loadSpecs();
  }, [loadSpecs, specs.length]);

  const selectedSpec = specs.find((spec) => rowKey(spec) === selectedKey) ?? specs[0] ?? null;
  const selectedDraft = selectedSpec ? getDraft(selectedSpec) : createDraft();

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

  function selectRow(spec: SpecRow) {
    setSelectedKey(rowKey(spec));
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
        <span className="muted">Main grid keeps core comparison columns. Proposal and discussion fields are edited in tabs below.</span>
      </div>

      <div className="review-workspace">
        <div className="table-card review-grid-card compact-grid-card">
          <div className="table-scroll improved-table-scroll">
            <table className="review-grid-table compact-review-grid-table">
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((spec) => {
                  const draft = getDraft(spec);
                  const key = rowKey(spec);
                  const machineType = spec.conditions[0]?.machineType ?? 'None';
                  const isSelected = selectedSpec ? rowKey(selectedSpec) === key : false;
                  return (
                    <tr key={key} className={isSelected ? 'selected-grid-row' : ''} onClick={() => selectRow(spec)}>
                      <td className="code-cell"><Link to={'/specs/' + spec.aiCode} onClick={(event) => event.stopPropagation()}>{spec.aiCode}</Link></td>
                      <td>{spec.side}</td>
                      <td>{spec.unitDummy}</td>
                      <td>{spec.area}</td>
                      <td>{spec.defectName}</td>
                      <td>{machineType}</td>
                      <td><input className="grid-input" value={draft.defectNameMes} onChange={(event) => updateDraft(spec, { defectNameMes: event.target.value })} onClick={(event) => event.stopPropagation()} placeholder="MES name" /></td>
                      <td><textarea className="grid-textarea" value={draft.generalSpecText} onChange={(event) => updateDraft(spec, { generalSpecText: event.target.value })} onClick={(event) => event.stopPropagation()} /></td>
                      <td><pre className="grid-spec-text">{formatAiRmsSpecText(spec.aiSpecText)}</pre></td>
                      <td>
                        <select className="grid-select" value={draft.compareResult} onChange={(event) => updateDraft(spec, { compareResult: event.target.value as CompareResult })} onClick={(event) => event.stopPropagation()}>
                          {compareOptions.map((option) => <option key={option} value={option}>{compareLabels[option]}</option>)}
                        </select>
                      </td>
                      <td><textarea className="grid-textarea small" value={draft.note} onChange={(event) => updateDraft(spec, { note: event.target.value })} onClick={(event) => event.stopPropagation()} /></td>
                      <td className="action-cell">
                        <button type="button" onClick={(event) => { event.stopPropagation(); void saveRow(spec); }} disabled={savingKey === key}>{savingKey === key ? '저장중...' : '저장'}</button>
                        <Link className="detail-link" to={'/specs/' + spec.aiCode} onClick={(event) => event.stopPropagation()}>상세보기</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="review-tab-panel card">
          <div className="tab-panel-header">
            <div>
              <b>선택된 스펙</b>
              <p>{selectedRowLabel(selectedSpec)}</p>
            </div>
            {selectedSpec && <button type="button" onClick={() => void saveRow(selectedSpec)} disabled={savingKey === rowKey(selectedSpec)}>{savingKey === rowKey(selectedSpec) ? '저장중...' : '선택 항목 저장'}</button>}
          </div>

          <div className="tabs">
            <button type="button" className={activeTab === 'proposal' ? 'active' : ''} onClick={() => setActiveTab('proposal')}>AI팀 제안</button>
            <button type="button" className={activeTab === 'discussion' ? 'active' : ''} onClick={() => setActiveTab('discussion')}>협의 내용</button>
            <button type="button" className={activeTab === 'final' ? 'active' : ''} onClick={() => setActiveTab('final')}>최종 결과 / 이력</button>
          </div>

          {selectedSpec && activeTab === 'proposal' && (
            <div className="tab-content-grid">
              <label><span>AI Team Proposal</span><input className="grid-input" value={selectedDraft.aiTeamProposal} onChange={(event) => updateDraft(selectedSpec, { aiTeamProposal: event.target.value })} /></label>
              <label><span>Proposal Detail</span><textarea className="panel-textarea" value={selectedDraft.proposalDetail} onChange={(event) => updateDraft(selectedSpec, { proposalDetail: event.target.value })} /></label>
            </div>
          )}

          {selectedSpec && activeTab === 'discussion' && (
            <div className="tab-content-grid discussion-grid">
              <label><span>Department</span><input className="grid-input" value={selectedDraft.department} onChange={(event) => updateDraft(selectedSpec, { department: event.target.value })} /></label>
              <label><span>1st Discussion</span><textarea className="panel-textarea" value={selectedDraft.firstDiscussionResult} onChange={(event) => updateDraft(selectedSpec, { firstDiscussionResult: event.target.value })} /></label>
              <label><span>2nd Discussion</span><textarea className="panel-textarea" value={selectedDraft.secondDiscussionResult} onChange={(event) => updateDraft(selectedSpec, { secondDiscussionResult: event.target.value })} /></label>
            </div>
          )}

          {selectedSpec && activeTab === 'final' && (
            <div className="tab-content-grid">
              <label><span>Final Result</span><input className="grid-input" value={selectedDraft.finalResult} onChange={(event) => updateDraft(selectedSpec, { finalResult: event.target.value })} /></label>
              <div className="mini-summary">
                <b>Current Draft Summary</b>
                <p>Compare: {compareLabels[selectedDraft.compareResult]}</p>
                <p>Department: {selectedDraft.department || '-'}</p>
                <p>Final: {selectedDraft.finalResult || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
