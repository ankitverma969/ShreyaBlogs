import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';

function Contact() {
  return (
    <PageTransition>
      <SEO title="Contact" description="Send a note, collaboration idea, or reader message to Shreya Writes." />
      <section className="container contact-page">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Send a note, collaboration idea, or reader confession.</h1>
        </div>
        <form className="contact-form">
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <textarea rows="6" placeholder="Message" />
          <button className="primary-button" type="button">
            Send message
          </button>
        </form>
      </section>
    </PageTransition>
  );
}

export default Contact;
