import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🔍</span>
          <span>Finder</span>
        </Link>
        <nav className="header-nav">
          <Link to="/add" className="btn btn-primary btn-sm">
            + Add Location
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
