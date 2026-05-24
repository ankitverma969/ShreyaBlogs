function ShareCard({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="modal-backdrop">
      <section className="share-card-modal">
        <button className="share-close" type="button" onClick={onClose} aria-label="Close share card">
          x
        </button>
        <div className="poetry-share-card">
          <p>{post.category}</p>
          <h2>{post.title}</h2>
          <blockquote>{post.content.slice(0, 220)}...</blockquote>
          <span>Shreya Writes</span>
        </div>
      </section>
    </div>
  );
}

export default ShareCard;
