import { Link } from 'react-router-dom';
import { useSpecStore } from '../stores/specStore';

export function SpecListPage() {
  const { specs, summary, uploadSpecFile } = useSpecStore();

  return (
    <section className="page">
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
              if (file) uploadSpecFile(file);
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

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>AI Code</th><th>Defect</th><th>Area</th><th>Side</th><th>Unit/Dummy</th><th>Compare</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.aiCode}>
                <td><Link to={`/specs/${spec.aiCode}`}>{spec.aiCode}</Link></td>
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
    </section>
  );
}
