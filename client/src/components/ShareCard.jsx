import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

function ShareCard({ post, onClose }) {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!post) return null;

  const downloadImage = async () => {
    if (!cardRef.current || isDownloading) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${post.slug}-poetry-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="share-card-modal">
        <button 
          type="button" 
          onClick={downloadImage}
          disabled={isDownloading}
          style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, padding: '8px 16px', background: 'rgba(45,32,49,0.5)', color: '#fff', border: 'none', borderRadius: '24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
        >
          {isDownloading ? 'Saving...' : 'Download Image'}
        </button>
        <button 
          className="share-close" 
          type="button" 
          onClick={onClose} 
          aria-label="Close share card" 
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, width: '36px', height: '36px', background: 'rgba(45,32,49,0.5)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center' }}
        >
          ✕
        </button>
        <div className="poetry-share-card" ref={cardRef}>
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
