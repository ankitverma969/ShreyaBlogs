import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../hooks/useScrollToTop.js';
import { useAuth } from '../hooks/useAuth.js';

function AdminLayout() {
  useScrollToTop();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/v1/adminShreyaTiwari/login', { replace: true });
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>Ink Room</h1>
          <p>{admin?.email}</p>
        </div>
        <NavLink to="/v1/adminShreyaTiwari" end>
          <span aria-hidden="true">🏠</span> Dashboard
        </NavLink>
        <NavLink to="/v1/adminShreyaTiwari/create">
          <span aria-hidden="true">✍️</span> Create Post
        </NavLink>
        <NavLink to="/v1/adminShreyaTiwari/posts">
          <span aria-hidden="true">📂</span> Manage Posts
        </NavLink>
        <NavLink to="/v1/adminShreyaTiwari/analytics">
          <span aria-hidden="true">📊</span> Analytics
        </NavLink>
        <NavLink to="/v1/adminShreyaTiwari/comments">
          <span aria-hidden="true">💬</span> Comments
        </NavLink>
        <NavLink to="/v1/adminShreyaTiwari/settings">
          <span aria-hidden="true">⚙️</span> Settings
        </NavLink>
        <NavLink to="/">
          <span aria-hidden="true">🌐</span> View Site
        </NavLink>
        <button className="admin-logout" type="button" onClick={handleLogout}>
          <span aria-hidden="true">🚪</span> Logout
        </button>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
