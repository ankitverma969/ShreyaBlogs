import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';
import WritingCard from '../components/WritingCard.jsx';
import { publicService } from '../services/publicService.js';
import { useSocket } from '../context/SocketContext.jsx';

function Explore({ initialCategory }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: initialCategory || searchParams.get('category') || 'All',
    tag: searchParams.get('tag') || '',
    sort: searchParams.get('sort') || 'latest',
    language: searchParams.get('language') || 'all',
    page: Number(searchParams.get('page')) || 1
  });
  const socket = useSocket();

  const params = useMemo(() => filters, [filters]);

  useEffect(() => {
    publicService
      .posts(params)
      .then(({ data }) => {
        setPosts(data.posts);
        setPagination(data.pagination);
      })
      .catch(() => {
        setPosts([]);
        setPagination({ page: 1, pages: 1 });
      });

    setSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, value]) => value && value !== 'All' && value !== 'all')
          .map(([key, value]) => [key, String(value)])
      )
    );
  }, [params, setSearchParams]);

  useEffect(() => {
    if (!socket) return;
    const handlePostDeleted = (postId) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };
    socket.on('postDeleted', handlePostDeleted);
    return () => socket.off('postDeleted', handlePostDeleted);
  }, [socket]);

  useEffect(() => {
    publicService
      .categories()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (filters.search.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      publicService.suggestions(filters.search).then(({ data }) => setSuggestions(data.suggestions)).catch(() => setSuggestions([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [filters.search]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  }

  return (
    <PageTransition>
      <SEO
        title="Explore Hindi and English Writings"
        description="Search Hindi shayari, Devanagari poetry, English stories, mixed-language sher, romantic writings, heartbreak pieces, and life reflections."
        language="mixed"
      />
      <section className="container" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '56px', paddingBottom: '32px' }}>
        <div className="search-panel" style={{ width: '100%', maxWidth: '800px', background: 'rgba(255, 255, 255, 0.4)', padding: '16px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)', backdropFilter: 'blur(10px)' }}>
          <input
            type="search"
            placeholder="Search writings, tags, moods..."
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            style={{ borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.8)' }}
          />
          {suggestions.length > 0 && (
            <div className="suggestion-box">
              {suggestions.map((post) => (
                <button key={post._id} type="button" onClick={() => updateFilter('search', post.title)}>
                  {post.title}
                </button>
              ))}
            </div>
          )}
          <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} style={{ borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.8)' }}>
            <option value="latest">Latest</option>
            <option value="trending">Trending</option>
          </select>
          <select value={filters.language || 'all'} onChange={(event) => updateFilter('language', event.target.value)} style={{ borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.8)' }}>
            <option value="all">All languages</option>
            <option value="hindi">Hindi / हिन्दी</option>
            <option value="mixed">Mixed</option>
            <option value="english">English</option>
          </select>
        </div>

        <div className="filter-row" style={{ justifyContent: 'center', marginTop: '24px' }}>
          {['All', ...categories.map((item) => item.name)].map((category) => (
            <button
              key={category}
              className={filters.category === category ? 'active' : ''}
              type="button"
              onClick={() => updateFilter('category', category)}
            >
              {category}
            </button>
          ))}
        </div>

      </section>

      <section className="container section-block" style={{ paddingTop: '0' }}>

        <div className="card-grid">
          {posts.map((post) => (
            <WritingCard key={post._id || post.id} post={post} />
          ))}
        </div>
        {!posts.length && <p className="empty-state">No writings match this search yet.</p>}

        <div className="pagination-row">
          <button type="button" disabled={pagination.page <= 1} onClick={() => updateFilter('page', pagination.page - 1)}>
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => updateFilter('page', pagination.page + 1)}>
            Next
          </button>
        </div>
      </section>
    </PageTransition>
  );
}

export default Explore;
