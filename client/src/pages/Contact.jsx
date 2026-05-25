import { useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import SEO from '../components/SEO.jsx';
import Toast from '../components/Toast.jsx';
import { publicService } from '../services/publicService.js';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.email || !formData.message) {
      setToast({ type: 'error', message: 'Email and message are required' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await publicService.contact(formData);
      setToast({ type: 'success', message: 'Your message has been sent successfully!' });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Unable to send message' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <PageTransition>
      <SEO title="Contact" description="Send a note, collaboration idea, or reader message to Shreya Writes." />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="container contact-page">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Send a note, collaboration idea, or reader confession.</h1>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" value={formData.name} onChange={updateField} />
          <input name="email" type="email" placeholder="Email (required)" value={formData.email} onChange={updateField} required />
          <textarea name="message" rows="6" placeholder="Message (required)" value={formData.message} onChange={updateField} required />
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </section>
    </PageTransition>
  );
}

export default Contact;
