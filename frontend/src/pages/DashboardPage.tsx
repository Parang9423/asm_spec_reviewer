import { Link } from 'react-router-dom';

export function DashboardPage() {
  return (
    <section className="page">
      <h1>AI Spec Review System</h1>
      <p>RMS JSON 기반으로 AI Spec을 검토하고 General Spec 대비 수준과 협의 이력을 관리합니다.</p>
      <div className="summary-grid">
        <Link className="card" to="/specs"><b>Spec Review</b><span>Upload and review RMS JSON</span></Link>
        <Link className="card" to="/history"><b>History</b><span>Review history records</span></Link>
      </div>
    </section>
  );
}
