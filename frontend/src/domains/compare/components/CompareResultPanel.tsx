import { ResultBadge } from '../../../shared/components/ResultBadge';
import type { CompareResultDetail } from '../types';

export function CompareResultPanel({ result }: { result: CompareResultDetail | null }) {
  if (!result) return <div className="card muted">Run comparison after entering General Spec.</div>;
  return (
    <div className="card stack">
      <div className="row"><strong>Compare Result</strong><ResultBadge result={result.result} /></div>
      <p>{result.summary}</p>
      <table className="table">
        <thead><tr><th>Metric</th><th>AI</th><th>General</th><th>Result</th><th>Reason</th></tr></thead>
        <tbody>{result.comparableItems.map((item) => (
          <tr key={item.metric + String(item.aiValue) + String(item.generalValue)}>
            <td>{item.metric}</td>
            <td>{item.aiOperator} {item.aiValue}{item.aiUnit}</td>
            <td>{item.generalOperator} {item.generalValue}{item.generalUnit}</td>
            <td><ResultBadge result={item.result} /></td>
            <td>{item.reason}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
