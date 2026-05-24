import { memo } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton.jsx';

function WritingCard({ post, accent = false }) {
  const postId = post._id || post.id;

  return (
    <article className={`writing-card language-${post.language || 'mixed'} ${accent ? 'accent-card' : ''}`} lang={post.language === 'english' ? 'en' : 'hi'}>
      <div className="card-meta">
        <span>{post.category}</span>
        <span>{post.language || 'hindi'}</span>
        <span>{(post.views || 0).toLocaleString()} reads</span>
      </div>
      <h3 className="language-title">{post.title}</h3>
      <p className="handwritten">{post.excerpt || post.content?.slice(0, 130)}</p>
      <div className="tag-row">
        {(post.tags || []).slice(0, 4).map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
      <Link to={`/post/${post.slug}`} className="text-link">
        Read piece
      </Link>
      <LikeButton postId={postId} initialCount={post.likes || 0} />
    </article>
  );
}

export default memo(WritingCard);
