import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import Toast from '../components/Toast.jsx';
import { adminService } from '../services/adminService.js';
import { publicService } from '../services/publicService.js';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    publicService.post(id).then(({ data }) => {
      setPost(data.post);
      setIsLoading(false);
    }).catch(() => {
      setToast({ type: 'error', message: 'Unable to load post' });
      setIsLoading(false);
    });
  }, [id]);

  function updateField(event) {
    setPost((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function uploadFiles(event) {
    const { name, files } = event.target;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append(name, file));
    setIsUploading(true);

    try {
      const { data } = await adminService.uploadMedia(formData);
      setPost((current) => ({
        ...current,
        coverImage: data.uploaded.coverImage || current.coverImage,
        media: [...(current.media || []), ...(data.uploaded.media || [])]
      }));
      setToast({ type: 'success', message: 'Media uploaded' });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  }

  async function submitPost(status) {
    try {
      const payload = { ...post, status, media: JSON.stringify(post.media || []) };
      await adminService.updatePost(post._id, payload);
      setToast({ type: 'success', message: 'Post updated successfully' });
      if (status === 'published') {
        setTimeout(() => navigate('/v1/adminShreyaTiwari/posts'), 1000);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Unable to update post' });
    }
  }

  if (isLoading) return <PageTransition><div className="container">Loading editor...</div></PageTransition>;
  if (!post) return <PageTransition><div className="container">Post not found</div></PageTransition>;

  return (
    <PageTransition className="admin-page">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="eyebrow">Editing</p>
          <h1>{post.title || 'Untitled Post'}</h1>
        </div>
        <button className="ghost-button" onClick={() => navigate('/v1/adminShreyaTiwari/posts')}>
          ← Back to Manage Posts
        </button>
      </div>

      <div className="editor-grid">
        <form className="editor-form">
          <div className="editor-section">
            <h3>Basic Details</h3>
            <div className="form-row">
              <input name="title" type="text" placeholder="Title" value={post.title} onChange={updateField} />
              <select value={post.language} onChange={(e) => setPost(p => ({ ...p, language: e.target.value }))} aria-label="Writing language" autoComplete="off">
                <option value="hindi">Hindi / हिन्दी</option>
                <option value="mixed">Mixed Hindi + English</option>
                <option value="english">English</option>
              </select>
            </div>
            <div className="form-row">
              <select value={post.category} onChange={(e) => setPost(p => ({ ...p, category: e.target.value }))} autoComplete="off">
                <option>Poetry</option>
                <option>Shayari</option>
                <option>Story</option>
                <option>Letters</option>
              </select>
              <input name="category" type="text" placeholder="Custom category" value={post.category} onChange={updateField} autoComplete="off" />
            </div>
            <input name="tags" type="text" placeholder="Comma separated tags" value={post.tags} onChange={updateField} />
          </div>

          <div className="editor-section">
            <h3>Media</h3>
            <div className="form-row">
              <label className="file-field">
                Cover image
                <input name="coverImage" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={uploadFiles} />
              </label>
              <label className="file-field">
                Images
                <input name="images" type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={uploadFiles} />
              </label>
              <label className="file-field">
                Video
                <input name="video" type="file" accept=".mp4" onChange={uploadFiles} />
              </label>
            </div>
            {isUploading && <p className="form-note">Uploading media...</p>}
            
            {/* Show uploaded media to verify it was handled properly */}
            {(post.coverImage || (post.media && post.media.length > 0)) && (
              <div style={{ marginTop: '16px' }}>
                <h4>Current Uploaded Media:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {post.coverImage && <img src={post.coverImage} alt="Cover" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />}
                  {post.media && post.media.map((item, index) => {
                    if (item.type === 'video') return <div key={index} style={{ width: '80px', height: '80px', background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎥</div>;
                    return <img key={index} src={item.url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="editor-section">
            <h3>Content</h3>
            <textarea
              className={`rich-textarea language-${post.language}`}
              name="content"
              rows="14"
              placeholder="अपनी कविता, शायरी, कहानी या mixed-language writing लिखें..."
              value={post.content}
              onChange={updateField}
              lang={post.language === 'english' ? 'en' : 'hi'}
            />
          </div>

          <div className="editor-section">
            <h3>Publishing Settings</h3>
            <div className="form-row">
              <label className="checkbox-row">
                <input
                  name="isFeatured"
                  type="checkbox"
                  checked={post.isFeatured}
                  onChange={(event) => setPost((current) => ({ ...current, isFeatured: event.target.checked }))}
                />
                Feature on homepage
              </label>
              <select name="homepageSection" value={post.homepageSection} onChange={updateField}>
                <option value="default">Default homepage flow</option>
                <option value="hero">Hero candidate</option>
                <option value="featured">Featured section</option>
                <option value="latest">Latest section</option>
              </select>
            </div>
          </div>

          <div className="hero-actions editor-actions">
            <button className="ghost-button" type="button" onClick={() => submitPost('draft')}>
              Save as draft
            </button>
            <button className="primary-button" type="button" onClick={() => submitPost('published')}>
              Publish Changes
            </button>
          </div>
        </form>

        <aside className="live-preview">
          <p className="eyebrow">Live preview</p>
          {post.coverImage && <img src={post.coverImage} alt="" />}
          <h2 className={`language-title language-${post.language}`}>{post.title || 'Untitled writing'}</h2>
          <div className={`handwritten hindi-preview language-${post.language}`} lang={post.language === 'english' ? 'en' : 'hi'}>
            {post.content || 'आपकी handwritten Hindi preview यहाँ दिखाई देगी।'}
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}

export default EditPost;
