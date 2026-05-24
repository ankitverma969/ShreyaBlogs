import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { adminService } from '../services/adminService.js';

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService
      .analytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(() => setAnalytics(null))
      .finally(() => setIsLoading(false));
  }, []);

  const data = analytics || {};
  const visitorData = data.dailyVisitors?.length ? data.dailyVisitors : data.visitors || [];
  const maxVisitorValue = visitorData.length ? Math.max(...visitorData.map((item) => item.value), 1) : 1;

  return (
    <PageTransition className="admin-page">
      <div className="admin-title-row">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {isLoading ? (
        <Skeleton count={4} />
      ) : null}

      <div className="stats-grid admin-stats">
        {[
          ['Total posts', data.totalPosts],
          ['Total views', data.totalViews],
          ['Total likes', data.totalLikes],
          ['Total comments', data.totalComments],
          ['Unique visitors', data.uniqueVisitors || 0],
          ['Bounce rate', `${data.bounceRate || 0}%`],
          ['Avg read time', `${data.averageReadingTime || 0}s`],
          ['Trending post', data.trendingPost?.title || 'No post yet']
        ].map(([label, value], index) => (
          <motion.article
            key={label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <span>{label}</span>
            <strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong>
          </motion.article>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <h2>Visitor Analytics</h2>
          <div className="visitor-chart">
            {visitorData.map((item) => (
              <div key={item.label}>
                <span style={{ height: `${(item.value / maxVisitorValue) * 100}%` }} />
                <small>{item.label}</small>
              </div>
            ))}
            {!visitorData.length && <p className="empty-state">No visitor events yet.</p>}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Reaction Analytics</h2>
          <div className="admin-feed">
            {(data.reactionAnalytics || []).map((reaction) => (
              <article key={reaction._id || 'unknown'}>
                <strong>{reaction._id || 'unknown'}</strong>
                <p>{reaction.count} reactions</p>
              </article>
            ))}
            {!data.reactionAnalytics?.length && <p className="empty-state">No reactions yet.</p>}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Latest Comments</h2>
          <div className="admin-feed">
            {(data.latestComments || []).map((comment) => (
              <article key={comment._id}>
                <strong>{comment.username}</strong>
                <p>{comment.message}</p>
              </article>
            ))}
            {!data.latestComments?.length && <p className="empty-state">No comments yet.</p>}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Recent Uploads</h2>
          <div className="admin-feed">
            {(data.recentUploads || []).map((post) => (
              <article key={post._id}>
                <strong>{post.title}</strong>
                <p>{post.status}</p>
              </article>
            ))}
            {!data.recentUploads?.length && <p className="empty-state">No uploads yet.</p>}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default AdminDashboard;
