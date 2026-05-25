import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link className="brand" to="/" onClick={() => setIsOpen(false)}>
          <span className="brand-mark">S</span>
          <span>Shreya Writes</span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${isOpen ? 'is-open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
              {link.label}
            </NavLink>
          ))}

        </div>
      </nav>
    </header>
  );
}

export default Navbar;
