import { useMemo, useState } from 'react';
import type { SpecRow } from '../types';
import { ResultBadge } from '../../../shared/components/ResultBadge';

export function SpecTable({ data, onSelect }: { data: SpecRow[]; onSelect?: (aiCode: string) => void }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const filtered = useMemo(() => {
    const keyword = globalFilter.toLowerCase();
    return data.filter((row) => [row.aiCode, row.defectName, row.area, row.side].join(' ').toLowerCase().includes(keyword));
  }, [data, globalFilter]);

  return (
    <div className="card stack">
      <input placeholder="Search AI code, defect, area" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
      <table className="table">
        <thead><tr><th>AI Code</th><th>Defect</th><th>Area</th><th>Side</th><th>Compare</th><th>Status</th></tr></thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.aiCode} onClick={() => onSelect?.(row.aiCode)}>
              <td>{row.aiCode}</td>
              <td>{row.defectName}</td>
              <td>{row.area}</td>
              <td>{row.side}</td>
              <td><ResultBadge result={row.compareResult} /></td>
              <td>{row.reviewStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
