import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentsSection from '../components/CommentsSection.jsx';
import HandwrittenRenderer from '../components/HandwrittenRenderer.jsx';
import LikeButton from '../components/LikeButton.jsx';
import PageTransition from '../components/PageTransition.jsx';
import ReadingProgress from '../components/ReadingProgress.jsx';
import SEO from '../components/SEO.jsx';
import ShareCard from '../components/ShareCard.jsx';
import { publicService } from '../services/publicService.js';
import { useSocket } from '../context/SocketContext.jsx';
import { addRecentlyRead, getSavedReaction, isBookmarked, saveReaction, toggleBookmark } from '../utils/localLibrary.js';

function SinglePost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, setNotice] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const postRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    const startedAt = Date.now();
    setIsLoading(true);
    publicService
      .post(slug)
      .then(({ data }) => {
        setPost(data.post);
        setSuggestedPosts(data.suggestedPosts || []);
        postRef.current = data.post;
        setBookmarked(isBookmarked(data.post.slug));
        addRecentlyRead(data.post);
        publicService.view(data.post._id).catch(() => {});
      })
      .catch(() => {
        setPost(null);
        setSuggestedPosts([]);
      })
      .finally(() => setIsLoading(false));
    return () => {
      if (postRef.current?._id) {
        publicService.view(postRef.current._id, {
          readingTimeSeconds: Math.round((Date.now() - startedAt) / 1000)
        }).catch(() => {});
      }
    };
  }, [slug]);

  const updateLikes = useCallback(({ likes, counted }) => {
    setPost((current) => ({ ...current, likes }));
    setNotice(counted ? 'Your like warmed this page.' : 'You already liked this writing.');
  }, []);

  useEffect(() => {
    if (!socket || !post) return;
    const handlePostDeleted = (postId) => {
      if (post._id === postId) {
        setPost(null);
      }
    };
    socket.on('postDeleted', handlePostDeleted);
    return () => socket.off('postDeleted', handlePostDeleted);
  }, [socket, post]);

  if (isLoading) {
    return (
      <PageTransition>
        <section className="container reader-view">Loading writing...</section>
      </PageTransition>
    );
  }

  if (!post) {
    return (
      <PageTransition>
        <section className="container reader-view">
          <p className="empty-state">This writing could not be found.</p>
        </section>
      </PageTransition>
    );
  }



  async function sharePost() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
    publicService.share(post._id).then(({ data }) => setPost((current) => ({ ...current, shares: data.shares }))).catch(() => {});
    setNotice('Share link ready.');
  }

  function bookmarkPost() {
    setBookmarked(toggleBookmark(post));
  }

  return (
    <PageTransition>
      <SEO
        title={post.title}
        description={(post.content || '').slice(0, 155)}
        image={post.coverImage || '/icons/icon-512.svg'}
        type="article"
        article={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          author: { '@type': 'Person', name: post.authorName || 'Shreya Tiwari' },
          datePublished: post.publishedAt || post.createdAt,
          articleSection: post.category,
          inLanguage: post.language === 'english' ? 'en' : post.language === 'hindi' ? 'hi' : 'hi-en',
          keywords: (post.tags || []).join(', ')
        }}
        language={post.language}
      />
      <ReadingProgress />
      <ShareCard post={showShareCard ? post : null} onClose={() => setShowShareCard(false)} />
      <article className="reader-immersive">
        <section className="container reader-hero" style={{ textAlign: 'center', padding: '20px 0 10px', maxWidth: '800px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ marginBottom: '8px' }}>{post.category} / {post.language || 'hindi'}</p>
          <h1 className={`language-title language-${post.language || 'hindi'}`} lang={post.language === 'english' ? 'en' : 'hi'} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.2', marginBottom: '16px', marginTop: '0' }}>
            {post.title}
          </h1>
          <div className="reader-stats" style={{ justifyContent: 'center', opacity: 0.8, marginBottom: '16px' }}>
            <span>By {post.authorName || 'Shreya Tiwari'}</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            <span>{post.readingTime || 1} min read</span>
          </div>
          <div className="tag-row reader-tags" style={{ justifyContent: 'center' }}>
            {(post.tags || []).map((tag) => (
              <Link key={tag} to={`/explore?tag=${tag}`} style={{ background: 'var(--primary-light)', padding: '6px 16px', borderRadius: '24px', textDecoration: 'none', color: 'var(--white)', fontSize: '0.9rem' }}>
                #{tag}
              </Link>
            ))}
          </div>
        </section>

        {post.coverImage && (
          <section className="container cover-media">
            <img src={post.coverImage} alt={post.title} />
          </section>
        )}

        {post.media?.find((item) => item.type === 'video') && (
          <section className="container cover-media">
            <video src={post.media.find((item) => item.type === 'video').url} controls />
          </section>
        )}

        <section className="container reader-content-wrap" style={{ marginTop: '10px' }}>
          <div style={{ background: 'var(--paper-bg, rgba(255,255,255,0.8))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <HandwrittenRenderer content={post.content} language={post.language || 'hindi'} />
            
            <div className="ig-action-bar">
              <div className="ig-action-group">
                <LikeButton postId={post._id} initialCount={post.likes || 0} size="compact" onLiked={updateLikes} />
                
                <button 
                  type="button" 
                  className="ig-action-btn" 
                  onClick={() => {
                    setShowComments(prev => !prev);
                    if (!showComments) {
                      setTimeout(() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                  }} 
                  title="Comment"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </button>
                
                <button type="button" className="ig-action-btn" onClick={sharePost} title="Share">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
                
                <button type="button" className="ig-action-btn" onClick={() => setShowShareCard(true)} title="Generate Poetry Card">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </button>
              </div>
              
              <div className="ig-action-group">
                <button type="button" className="ig-action-btn" onClick={bookmarkPost} title="Bookmark">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>
            </div>
            {notice && <p className="form-note" style={{ margin: '0 24px 24px', textAlign: 'center' }}>{notice}</p>}
          </div>
        </section>

        {suggestedPosts.length > 0 && (
          <section className="container reading-navigation" style={{ padding: '40px 0', borderTop: 'none' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.5rem' }}>Keep reading</h2>
            <div className="reading-nav-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {suggestedPosts.map((suggestion) => (
                <Link key={suggestion._id} to={`/post/${suggestion.slug}`} className="nav-card" style={{ textAlign: 'center' }}>
                  <span className="eyebrow">{suggestion.category}</span>
                  <h3 className={`language-${suggestion.language || 'hindi'}`} style={{ marginTop: '12px' }}>{suggestion.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showComments && (
          <section className="container" id="comments-section" style={{ marginTop: '24px' }}>
            <CommentsSection postId={post._id} />
          </section>
        )}
      </article>
    </PageTransition>
  );
}

export default SinglePost;
