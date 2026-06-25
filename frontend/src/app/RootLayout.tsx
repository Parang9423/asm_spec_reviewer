import { NavLink, Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>AI Spec Review</h1>
        <nav className="nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/specs">Spec List</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
