import { useEffect, useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import Toast from '../components/Toast.jsx';
import { adminService } from '../services/adminService.js';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const { data } = await adminService.getMessages();
      setMessages(data.messages);
    } catch {
      setToast({ type: 'error', message: 'Unable to load messages' });
    }
  }

  async function markAsRead(id) {
    try {
      await adminService.markMessageRead(id);
      setMessages((current) => current.map((msg) => (msg._id === id ? { ...msg, isRead: true } : msg)));
    } catch {
      setToast({ type: 'error', message: 'Unable to update message' });
    }
  }

  async function deleteMessage(id) {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await adminService.deleteMessage(id);
      setMessages((current) => current.filter((msg) => msg._id !== id));
      setToast({ type: 'success', message: 'Message deleted' });
    } catch {
      setToast({ type: 'error', message: 'Unable to delete message' });
    }
  }

  return (
    <PageTransition className="admin-page">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <p className="eyebrow">Inbox</p>
      <h1>Contact Messages</h1>

      <div className="admin-table">
        {messages.map((msg) => (
          <article key={msg._id} style={{ opacity: msg.isRead ? 0.6 : 1 }}>
            <div>
              <h2>{msg.name} ({msg.email})</h2>
              <p>{new Date(msg.createdAt).toLocaleString()}</p>
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </div>
            </div>
            <div className="table-actions">
              {!msg.isRead && (
                <button type="button" onClick={() => markAsRead(msg._id)}>
                  Mark as read
                </button>
              )}
              <button className="danger-button" type="button" onClick={() => deleteMessage(msg._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!messages.length && <p className="empty-state">No messages found.</p>}
      </div>
    </PageTransition>
  );
}

export default AdminMessages;
