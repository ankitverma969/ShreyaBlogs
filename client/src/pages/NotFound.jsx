import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';

function NotFound() {
  return (
    <PageTransition>
      <section className="not-found">
        <p className="eyebrow">404</p>
        <h1>This page slipped between two diary pages.</h1>
        <Link className="primary-button" to="/">
          Return home
        </Link>
      </section>
    </PageTransition>
  );
}

export default NotFound;
