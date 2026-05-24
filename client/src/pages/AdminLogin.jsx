import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import { useAuth } from '../hooks/useAuth.js';

function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/v1/adminShreyaTiwari';

  if (isAuthenticated) {
    return <Navigate to="/v1/adminShreyaTiwari" replace />;
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(destination, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <section className="auth-page">
        <form className="auth-card admin-auth-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Private desk</p>
          <h1>Admin Login</h1>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={updateField}
            autoComplete="current-password"
          />
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : 'Enter dashboard'}
          </button>
        </form>
      </section>
    </PageTransition>
  );
}

export default AdminLogin;
