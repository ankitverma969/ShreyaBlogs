import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.jsx';
import PageTransition from '../components/PageTransition.jsx';
import Toast from '../components/Toast.jsx';
import { adminService } from '../services/adminService.js';

function ManagePosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    adminService
      .posts()
      .then(({ data }) => setPosts(data.posts))
      .catch(() => setPosts([]));
  }, []);

  const filteredPosts = useMemo(
    () =>
      posts
        .filter((post) => category === 'All' || post.category === category)
        .filter((post) => post.title.toLowerCase().includes(query.toLowerCase())),
    [posts, query, category]
  );

  async function togglePublish(post) {
    const status = post.status === 'published' ? 'unpublished' : 'published';
    try {
      await adminService.updatePost(post._id, { status });
      setPosts((current) => current.map((item) => (item._id === post._id ? { ...item, status } : item)));
      setToast({ type: 'success', message: `Post ${status}` });
    } catch {
      setToast({ type: 'error', message: 'Unable to update post' });
    }
  }

  async function savePostControls(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reactions = {
      loved: form.get('loved'),
      emotional: form.get('emotional'),
      beautiful: form.get('beautiful'),
      painful: form.get('painful'),
      powerful: form.get('powerful')
    };

    const payload = {
      category: form.get('category'),
      language: form.get('language'),
      likes: form.get('likes'),
      views: form.get('views'),
      shares: form.get('shares'),
      reactions,
      isFeatured: form.get('isFeatured') === 'on',
      homepageSection: form.get('homepageSection')
    };

    try {
      const { data } = await adminService.updatePost(editTarget._id, payload);
      setPosts((current) => current.map((item) => (item._id === editTarget._id ? data.post : item)));
      setEditTarget(null);
      setToast({ type: 'success', message: 'Post controls updated' });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Unable to update controls' });
    }
  }

  async function confirmDelete() {
    try {
      await adminService.deletePost(deleteTarget._id);
      setPosts((current) => current.filter((post) => post._id !== deleteTarget._id));
      setToast({ type: 'success', message: 'Post deleted' });
    } catch {
      setToast({ type: 'error', message: 'Unable to delete post' });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <PageTransition className="admin-page">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete post?"
        message="This removes the writing and its local uploaded media references."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {editTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="confirm-modal admin-control-form" onSubmit={savePostControls}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Post controls</h2>
              <button 
                type="button" 
                onClick={() => setEditTarget(null)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.5rem', cursor: 'pointer', padding: '0 8px' }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <label>
              Language
              <select name="language" defaultValue={editTarget.language || 'hindi'}>
                <option value="hindi">Hindi / हिन्दी</option>
                <option value="mixed">Mixed Hindi + English</option>
                <option value="english">English</option>
              </select>
            </label>
            <label>
              Category
              <input name="category" defaultValue={editTarget.category} />
            </label>
            <div className="metric-grid">
              <label>
                Likes
                <input name="likes" type="number" min="0" defaultValue={editTarget.likes || 0} />
              </label>
              <label>
                Views
                <input name="views" type="number" min="0" defaultValue={editTarget.views || 0} />
              </label>
              <label>
                Shares
                <input name="shares" type="number" min="0" defaultValue={editTarget.shares || 0} />
              </label>
            </div>
            <div className="metric-grid">
              {['loved', 'emotional', 'beautiful', 'painful', 'powerful'].map((reaction) => (
                <label key={reaction}>
                  {reaction}
                  <input name={reaction} type="number" min="0" defaultValue={editTarget.reactions?.[reaction] || 0} />
                </label>
              ))}
            </div>
            <label className="checkbox-row">
              <input name="isFeatured" type="checkbox" defaultChecked={editTarget.isFeatured} />
              Featured on homepage
            </label>
            <label>
              Homepage section
              <select name="homepageSection" defaultValue={editTarget.homepageSection || 'default'}>
                <option value="default">Default</option>
                <option value="hero">Hero</option>
                <option value="featured">Featured</option>
                <option value="latest">Latest</option>
              </select>
            </label>
            <div className="hero-actions">
              <button className="primary-button" type="submit">Save controls</button>
              <button className="ghost-button" type="button" onClick={() => setEditTarget(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <p className="eyebrow">Library</p>
      <h1>Manage Posts</h1>

      <div className="admin-toolbar">
        <input type="search" placeholder="Search posts" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>All</option>
          <option>Poetry</option>
          <option>Shayari</option>
          <option>Story</option>
          <option>Letters</option>
        </select>
      </div>

      <div className="admin-table">
        {filteredPosts.map((post) => (
          <article key={post._id}>
            <div>
              <h2>{post.title}</h2>
              <p>
                {post.category} / {post.language || 'hindi'} / {post.status || 'draft'} / {(post.views || 0).toLocaleString()} views
              </p>
            </div>
            <div className="table-actions">
              <button type="button" onClick={() => navigate(`/v1/adminShreyaTiwari/posts/edit/${post.slug}`)}>Edit Post</button>
              <button type="button" onClick={() => setEditTarget(post)}>Controls</button>
              <button type="button" onClick={() => togglePublish(post)}>
                {post.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button className="danger-button" type="button" onClick={() => setDeleteTarget(post)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!filteredPosts.length && <p className="empty-state">No posts found.</p>}
      </div>
    </PageTransition>
  );
}

export default ManagePosts;
