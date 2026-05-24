import PageTransition from '../components/PageTransition.jsx';
import WritingCard from '../components/WritingCard.jsx';
import { getBookmarks } from '../utils/localLibrary.js';

function Bookmarks() {
  const bookmarks = getBookmarks();

  return (
    <PageTransition>
      <section className="container page-hero compact-hero">
        <p className="eyebrow">Saved locally</p>
        <h1>Your bookmarked writings</h1>
      </section>
      <section className="container section-block">
        <div className="card-grid">
          {bookmarks.map((post) => (
            <WritingCard key={post.slug} post={post} />
          ))}
        </div>
        {!bookmarks.length && <p>No bookmarks yet. Save a writing from its reading page.</p>}
      </section>
    </PageTransition>
  );
}

export default Bookmarks;
