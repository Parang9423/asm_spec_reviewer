import type { SpecRow } from '../types';

export function SpecDetailViewer({ spec }: { spec: SpecRow }) {
  return (
    <div className="card stack">
      <div>
        <h3 style={{ margin: 0 }}>{spec.aiCode} / {spec.defectName}</h3>
        <div className="muted">{spec.side} / {spec.unitDummy} / {spec.area}</div>
      </div>
      {spec.remark && <div><strong>Remark</strong><p>{spec.remark}</p></div>}
      <div>
        <strong>AI Spec</strong>
        <pre>{spec.aiSpecText}</pre>
      </div>
    </div>
  );
}
