import { useEffect, useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import Toast from '../components/Toast.jsx';
import { adminService } from '../services/adminService.js';

const initialPost = {
  title: '',
  content: '',
  category: 'Poetry',
  language: 'hindi',
  tags: '',
  coverImage: '',
  media: [],
  isFeatured: false,
  homepageSection: 'default'
};

function CreatePost() {
  const [post, setPost] = useState(() => {
    const draft = localStorage.getItem('adminPostDraft');
    return draft ? JSON.parse(draft) : initialPost;
  });
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('adminPostDraft', JSON.stringify(post));
      setToast({ type: 'info', message: 'Draft autosaved' });
    }, 6000);

    return () => clearInterval(timer);
  }, [post]);

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
        media: [...current.media, ...(data.uploaded.media || [])]
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
      const payload = { ...post, status, media: JSON.stringify(post.media) };
      const { data } = await adminService.createPost(payload);
      setToast({ type: 'success', message: data.message });
      if (status === 'published') {
        localStorage.removeItem('adminPostDraft');
        setPost(initialPost);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Unable to save post' });
    }
  }

  return (
    <PageTransition className="admin-page">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <p className="eyebrow">New writing</p>
      <h1>Create Post</h1>
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
              Save draft
            </button>
            <button className="primary-button" type="button" onClick={() => submitPost('published')}>
              Publish post
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

export default CreatePost;
