import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-newspaper me-2"></i>UPSC News Processor
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                to="/"
              >
                <i className="fas fa-home me-1"></i>Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/upload') ? 'active' : ''}`} 
                to="/upload"
              >
                <i className="fas fa-upload me-1"></i>Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/news') ? 'active' : ''}`} 
                to="/news"
              >
                <i className="fas fa-list me-1"></i>All News
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/context') ? 'active' : ''}`} 
                to="/context"
              >
                <i className="fas fa-history me-1"></i>Context
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/perspective') ? 'active' : ''}`} 
                to="/perspective"
              >
                <i className="fas fa-balance-scale me-1"></i>Perspective
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
