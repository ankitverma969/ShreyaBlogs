import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';
import WritingCard from '../components/WritingCard.jsx';
import { publicService } from '../services/publicService.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useEffect, useState } from 'react';

function Home() {
  const [home, setHome] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -80]);
  const featured = home?.featured;
  const trending = home?.trending || [];
  const latest = home?.latest || [];
  const categories = home?.categories || [];
  const hindiFeatured = home?.hindiFeatured;
  const hindiTrending = home?.hindiTrending || [];

  useEffect(() => {
    publicService.home().then(({ data }) => setHome(data)).catch(() => setHome(null)).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handlePostDeleted = (postId) => {
      setHome((prev) => {
        if (!prev) return prev;
        const filterFn = (p) => p._id !== postId;
        return {
          ...prev,
          featured: prev.featured?._id === postId ? null : prev.featured,
          trending: prev.trending?.filter(filterFn) || [],
          latest: prev.latest?.filter(filterFn) || [],
          hindiFeatured: prev.hindiFeatured?._id === postId ? null : prev.hindiFeatured,
          hindiTrending: prev.hindiTrending?.filter(filterFn) || [],
        };
      });
    };
    socket.on('postDeleted', handlePostDeleted);
    return () => socket.off('postDeleted', handlePostDeleted);
  }, [socket]);

  return (
    <PageTransition>
      <SEO
        title="Handwritten Hindi Poetry, Shayari and Stories"
        description="Read Hindi shayari, Devanagari poetry, English poems, and mixed-language stories in an immersive handwritten digital diary."
        language="mixed"
      />
      <section className="hero-section public-hero">
        <div className="floating-particles" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="container hero-grid">
          <motion.div className="hero-copy" style={{ y }}>
            <p className="eyebrow">An emotional digital diary</p>
            <h1 className="handwriting-reveal">Words that arrive softly, and stay in the heart forever.</h1>
            <p>
              Read Hindi shayari, Devanagari poems, English stories, and mixed-language pieces rendered like ink on warm paper,
              with anonymous reactions from hearts that understood.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" to="/explore">
                Explore writings
              </Link>
              <Link className="ghost-button" to={featured ? `/post/${featured.slug}` : '/explore'}>
                Read featured
              </Link>
            </div>
          </motion.div>
          <motion.div className="hero-paper diary-cover" initial={{ rotate: -4 }} animate={{ rotate: -2 }}>
            <span>today&apos;s page</span>
            <p>{featured?.excerpt || featured?.content || (isLoading ? 'Opening the first page...' : 'The archive is waiting for its first published writing.')}</p>
          </motion.div>
        </div>
      </section>

      {featured && <section className="container section-block">
        <div className="section-heading">
          <p className="eyebrow">Featured writing</p>
          <h2>{featured.title}</h2>
        </div>
        <WritingCard post={featured} accent />
      </section>}

      <section className="container section-block">
        <div className="section-heading">
          <p className="eyebrow">Trending</p>
          <h2>Writings readers are holding close</h2>
        </div>
        {trending.length ? <div className="card-grid">
          {trending.slice(0, 6).map((post) => (
            <WritingCard key={post._id || post.id} post={post} />
          ))}
        </div> : <p className="empty-state">Trending will appear after real readers view, like, share, or react.</p>}
      </section>





      <section className="container section-block">
        <div className="section-heading">
          <p className="eyebrow">Latest uploads</p>
          <h2>Fresh ink</h2>
        </div>
        {latest.length > 0 ? (
          <div className="card-grid">
            {latest.slice(0, 3).map((post) => (
              <WritingCard key={post._id || post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No published writings yet.</p>
        )}
      </section>
    </PageTransition>
  );
}

export default Home;
