import type { RmsSummary } from '../types';

export function SpecSummaryCard({ summary }: { summary: RmsSummary | null }) {
  if (!summary) return <div className="card muted">Upload an RMS JSON file to see summary data.</div>;
  return (
    <div className="card row" style={{ justifyContent: 'space-between' }}>
      <div><strong>Customer</strong><br />{summary.customer}</div>
      <div><strong>Category</strong><br />{summary.category3}</div>
      <div><strong>Rev</strong><br />{summary.rmsRev}</div>
      <div><strong>Rev Date</strong><br />{summary.rmsRevDateTime}</div>
      <div><strong>Defects</strong><br />{summary.defectCount}</div>
    </div>
  );
}
