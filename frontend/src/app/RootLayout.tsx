import { NavLink, Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div>
            <h1>SIMITECH ADC SYSTEM</h1>
            <p>AI Spec Review & Analysis</p>
          </div>
        </div>
        <nav className="top-nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/specs">AI Spec Review</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>
        <div className="user-chip">
          <span className="status-dot" />
          <div>
            <b>SIMITECH_AI</b>
            <p>AI Tech Team</p>
          </div>
        </div>
      </header>
      <main className="main"><Outlet /></main>
      <footer className="app-footer">
        <span>© 2026 SIMITECH</span>
        <span>AI Spec Review System v1.0.0</span>
      </footer>
    </div>
  );
}
