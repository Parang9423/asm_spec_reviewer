import { Link, useNavigate } from 'react-router-dom';
import { useSpecStore } from '../stores/specStore';

export function SpecListPage() {
  const navigate = useNavigate();
  const specs = useSpecStore((state) => state.specs);
  const summary = useSpecStore((state) => state.summary);
  const uploadSpec = useSpecStore((state) => state.uploadSpec);

  return (
    <section className="page spec-list-page">
      <header className="page-header">
        <div>
          <h1>Spec List</h1>
          <p>Upload RMS JSON and review AI Spec rows.</p>
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
        <span className="muted">Click a row to open detail review.</span>
      </div>

      <div className="table-card spec-table-card">
        <div className="table-scroll">
          <table className="spec-table">
            <colgroup>
              <col className="col-code" />
              <col className="col-defect" />
              <col className="col-area" />
              <col className="col-side" />
              <col className="col-unit" />
              <col className="col-compare" />
              <col className="col-status" />
            </colgroup>
            <thead>
              <tr>
                <th>AI Code</th>
                <th>Defect</th>
                <th>Area</th>
                <th>Side</th>
                <th>Unit/Dummy</th>
                <th>Compare</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((spec) => (
                <tr key={`${spec.aiCode}-${spec.side}-${spec.unitDummy}-${spec.area}`} onClick={() => navigate('/specs/' + spec.aiCode)} className="clickable-row">
                  <td className="code-cell"><Link to={'/specs/' + spec.aiCode} onClick={(event) => event.stopPropagation()}>{spec.aiCode}</Link></td>
                  <td>{spec.defectName}</td>
                  <td>{spec.area}</td>
                  <td>{spec.side}</td>
                  <td>{spec.unitDummy}</td>
                  <td>{spec.compareResult}</td>
                  <td>{spec.reviewStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
