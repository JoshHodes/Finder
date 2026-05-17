import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <span>Finder</span>
        </Link>
        <nav className="header-nav">
          <Link to="/add" className="btn btn-primary btn-sm">
            Add Location
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
