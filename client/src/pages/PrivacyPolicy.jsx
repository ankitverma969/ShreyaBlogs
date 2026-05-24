import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';

function PrivacyPolicy() {
  return (
    <PageTransition>
      <SEO title="Privacy Policy" description="Privacy details for anonymous reading, comments, moderation, and abuse prevention." />
      <section className="container page-hero policy-page">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p>
          This public poetry platform does not create public user accounts. Limited technical
          information such as IP address, approximate location, browser information, and device
          fingerprint may be stored for moderation, abuse prevention, analytics, and platform safety.
        </p>
        <p>
          Bookmarks, reading history, and saved reactions are stored locally in your browser. They are
          not account-based and can be cleared by clearing browser storage.
        </p>
      </section>
    </PageTransition>
  );
}

export default PrivacyPolicy;
