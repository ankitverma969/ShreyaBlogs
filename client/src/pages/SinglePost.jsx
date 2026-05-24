import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentsSection from '../components/CommentsSection.jsx';
import HandwrittenRenderer from '../components/HandwrittenRenderer.jsx';
import LikeButton from '../components/LikeButton.jsx';
import PageTransition from '../components/PageTransition.jsx';
import ReadingProgress from '../components/ReadingProgress.jsx';
import SEO from '../components/SEO.jsx';
import ShareCard from '../components/ShareCard.jsx';
import ReactionBar from '../components/ReactionBar.jsx';
import { publicService } from '../services/publicService.js';
import { addRecentlyRead, getSavedReaction, isBookmarked, saveReaction, toggleBookmark } from '../utils/localLibrary.js';

function SinglePost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReaction, setSelectedReaction] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, setNotice] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);
  const postRef = useRef(null);

  useEffect(() => {
    const startedAt = Date.now();
    setIsLoading(true);
    publicService
      .post(slug)
      .then(({ data }) => {
        setPost(data.post);
        postRef.current = data.post;
        setSelectedReaction(getSavedReaction(data.post._id));
        setBookmarked(isBookmarked(data.post.slug));
        addRecentlyRead(data.post);
        publicService.view(data.post._id).catch(() => {});
      })
      .catch(() => {
        setPost(null);
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

  async function react(reaction) {
    if (selectedReaction) {
      setNotice('Your reaction is already saved for this writing.');
      return;
    }

    try {
      const { data } = await publicService.react(post._id, reaction);
      saveReaction(post._id, reaction);
      setSelectedReaction(reaction);
      setPost((current) => ({ ...current, reactions: data.reactions }));
      setNotice(data.message);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to react right now.');
    }
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
        <section className="container reader-hero">
          <Link className="text-link" to="/explore">
            Back to explore
          </Link>
          <p className="eyebrow">{post.category} / {post.language || 'hindi'}</p>
          <h1 className={`language-title language-${post.language || 'hindi'}`} lang={post.language === 'english' ? 'en' : 'hi'}>
            {post.title}
          </h1>
          <div className="reader-stats">
            <span>By {post.authorName || 'Shreya Tiwari'}</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            <span>{post.readingTime || 1} min read</span>
          </div>
          <div className="tag-row reader-tags">
            {(post.tags || []).map((tag) => (
              <Link key={tag} to={`/explore?tag=${tag}`}>
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

        <section className="container reader-content-wrap">
          <HandwrittenRenderer content={post.content} language={post.language || 'hindi'} />
        </section>

        <section className="container interaction-panel">
          <div className="interaction-heading">
            <p className="eyebrow">Hold this writing close</p>
            <h2>Leave a little heartbeat on the page</h2>
          </div>
          <div className="reader-actions">
            <LikeButton postId={post._id} initialCount={post.likes || 0} size="large" onLiked={updateLikes} />
            <button type="button" onClick={bookmarkPost}>
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button type="button" onClick={sharePost}>
              Share / {(post.shares || 0).toLocaleString()}
            </button>
            <button type="button" onClick={() => setShowShareCard(true)}>
              Poetry card
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${window.location.href}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <span>{(post.views || 0).toLocaleString()} views</span>
          </div>
          <ReactionBar counts={post.reactions} selected={selectedReaction} onReact={react} />
          {notice && <p className="form-note">{notice}</p>}
        </section>

        <section className="container">
          <CommentsSection postId={post._id} />
        </section>
      </article>
    </PageTransition>
  );
}

export default SinglePost;
