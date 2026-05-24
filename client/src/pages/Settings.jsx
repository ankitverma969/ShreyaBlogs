import PageTransition from '../components/PageTransition.jsx';
import { useAuth } from '../hooks/useAuth.js';

function Settings() {
  const { admin } = useAuth();

  return (
    <PageTransition className="admin-page">
      <p className="eyebrow">Private settings</p>
      <h1>Settings</h1>
      <section className="admin-panel settings-grid">
        <label>
          Admin email
          <input type="email" value={admin?.email || ''} readOnly />
        </label>
        <label>
          Session mode
          <input type="text" value="HTTP-only JWT cookie" readOnly />
        </label>
        <label>
          Public admin route
          <input type="text" value="/v1/adminShreyaTiwari" readOnly />
        </label>
      </section>
    </PageTransition>
  );
}

export default Settings;
