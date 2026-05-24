import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';

function About() {
  return (
    <PageTransition>
      <SEO title="About" description="About Shreya Writes, a soft handwritten home for poetry, shayari, and stories." />
      <section className="container page-hero">
        <p className="eyebrow">About</p>
        <h1>A small literary room for feelings that refuse to stay ordinary.</h1>
        <p>
          This platform is built for intimate poems, shayari, lyrical stories, and
          reflections that feel handwritten even on a screen.
        </p>
      </section>
    </PageTransition>
  );
}

export default About;
