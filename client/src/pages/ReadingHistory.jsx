import PageTransition from '../components/PageTransition.jsx';
import WritingCard from '../components/WritingCard.jsx';
import { getReadingHistory } from '../utils/localLibrary.js';

function ReadingHistory() {
  const history = getReadingHistory();

  return (
    <PageTransition>
      <section className="container page-hero compact-hero">
        <p className="eyebrow">Private to this browser</p>
        <h1>Reading history</h1>
      </section>
      <section className="container section-block">
        <div className="card-grid">
          {history.map((post) => (
            <WritingCard key={post.slug} post={post} />
          ))}
        </div>
        {!history.length && <p>No reading history yet.</p>}
      </section>
    </PageTransition>
  );
}

export default ReadingHistory;
