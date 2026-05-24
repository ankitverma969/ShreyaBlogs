import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';

function TermsOfService() {
  return (
    <PageTransition>
      <SEO title="Terms of Service" description="Terms for using Shreya Writes and participating in anonymous comments." />
      <section className="container page-hero policy-page">
        <p className="eyebrow">Terms</p>
        <h1>Terms of Service</h1>
        <p>
          By reading or commenting, you agree not to abuse, spam, harass, or attempt to manipulate
          anonymous interactions. Comments may be moderated, hidden, deleted, shadow banned, or blocked
          when they appear unsafe or abusive.
        </p>
        <p>
          Limited technical information may be used to protect the platform and maintain a peaceful
          reading space.
        </p>
      </section>
    </PageTransition>
  );
}

export default TermsOfService;
