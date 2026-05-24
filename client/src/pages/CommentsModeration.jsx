import { useEffect, useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import Toast from '../components/Toast.jsx';
import { adminService } from '../services/adminService.js';

function CommentsModeration() {
  const [comments, setComments] = useState([]);
  const [overview, setOverview] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    adminService
      .moderationOverview()
      .then(({ data }) => {
        setOverview(data.moderation);
        setComments(data.moderation.suspiciousComments);
      })
      .catch(() => setComments([]));
  }, []);

  function formatLocation(location) {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    return [location.city, location.region, location.country].filter(Boolean).join(', ') || 'Unknown';
  }

  async function moderate(id, action) {
    try {
      await adminService.moderateComment(id, action);
      if (action === 'delete' || action === 'approve') {
        setComments((current) => current.filter((comment) => comment._id !== id));
      }
      setToast({ type: 'success', message: 'Moderation action applied' });
    } catch {
      setToast({ type: 'error', message: 'Unable to moderate comment' });
    }
  }

  async function removeIdentity(id) {
    try {
      await adminService.removeIdentityAction(id);
      setOverview((current) => ({
        ...current,
        blockedIdentities: current.blockedIdentities.filter((identity) => identity._id !== id)
      }));
      setToast({ type: 'success', message: 'Identity unblocked' });
    } catch {
      setToast({ type: 'error', message: 'Unable to unblock identity' });
    }
  }

  return (
    <PageTransition className="admin-page">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <p className="eyebrow">Safety desk</p>
      <h1>Advanced Moderation</h1>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <h2>Spam statistics</h2>
          <div className="admin-feed">
            {(overview?.spamStats || []).map((stat) => (
              <article key={stat._id}>
                <strong>{stat._id}</strong>
                <p>
                  {stat.count} comments / spam {Math.round((stat.avgSpam || 0) * 100)}% / toxicity{' '}
                  {Math.round((stat.avgToxicity || 0) * 100)}%
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Repeated fingerprints</h2>
          <div className="admin-feed">
            {(overview?.repeatedFingerprints || []).map((item) => (
              <article key={item._id}>
                <strong>{item._id}</strong>
                <p>{item.count} actions / {item.ips?.length || 0} IPs</p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Blocked and shadow banned</h2>
          <div className="admin-feed">
            {(overview?.blockedIdentities || []).map((identity) => (
              <article key={identity._id}>
                <strong>{identity.status}</strong>
                <p>{identity.type}: {identity.value}</p>
                <button type="button" onClick={() => removeIdentity(identity._id)}>
                  Unblock
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="moderation-list">
        {comments.map((comment) => (
          <article key={comment._id} className="admin-panel">
            <div>
              <h2>{comment.username}</h2>
              <p>{comment.message}</p>
              <small>
                IP: {comment.ipAddress || 'Unknown'} / Location: {formatLocation(comment.location)} / Browser:{' '}
                {comment.browserInfo || 'Unknown'} / Fingerprint: {comment.fingerprint || 'Unknown'}
              </small>
              <div className="risk-row">
                <span>Level {comment.moderationLevel || 'safe'}</span>
                <span>Spam {Math.round((comment.spamScore || 0) * 100)}%</span>
                <span>Toxicity {Math.round((comment.toxicityScore || 0) * 100)}%</span>
                {(comment.moderationReasons || []).map((reason) => (
                  <span key={reason}>{reason}</span>
                ))}
              </div>
            </div>
            <div className="table-actions">
              <button type="button" onClick={() => moderate(comment._id, 'approve')}>
                Approve
              </button>
              <button type="button" onClick={() => moderate(comment._id, 'spam')}>
                Mark spam
              </button>
              <button type="button" onClick={() => moderate(comment._id, 'blockIp')}>
                Block IP
              </button>
              <button type="button" onClick={() => moderate(comment._id, 'shadowBan')}>
                Shadow ban
              </button>
              <button className="danger-button" type="button" onClick={() => moderate(comment._id, 'delete')}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!comments.length && <p className="empty-state">No comments need moderation.</p>}
      </div>
    </PageTransition>
  );
}

export default CommentsModeration;
