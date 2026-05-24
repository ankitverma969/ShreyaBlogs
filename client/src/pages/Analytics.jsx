import { useEffect, useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { adminService } from '../services/adminService.js';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    adminService.analytics().then(({ data }) => setAnalytics(data.analytics)).catch(() => setAnalytics(null));
  }, []);

  const visitors = analytics?.visitors || [];
  const max = visitors.length ? Math.max(...visitors.map((item) => item.value)) : 1;

  return (
    <PageTransition className="admin-page">
      <p className="eyebrow">Reader signals</p>
      <h1>Analytics</h1>
      {!analytics ? <Skeleton count={5} /> : null}
      <section className="admin-panel wide-panel">
        <h2>Visitor graph</h2>
        <div className="visitor-chart large-chart">
          {visitors.map((item) => (
            <div key={item.label}>
              <span style={{ height: `${(item.value / max) * 100}%` }} />
              <small>{item.label}</small>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default Analytics;
