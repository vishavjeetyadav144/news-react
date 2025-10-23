import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setDropdownOpen(false);
    await logout();
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = (e) => {
    e.preventDefault();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown')) {
        setDropdownOpen(false);
      }
      if (mobileMenuOpen && !event.target.closest('.navbar')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen, mobileMenuOpen]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          <i className="fas fa-graduation-cap me-2 text-success"></i>
          <span className="text-dark">UPSC</span>
          <span className="text-success">News</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : 'collapse'}`} id="navbarNav">
          <ul className="navbar-nav me-auto ms-lg-4">
            <li className="nav-item">
              <Link
                className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/') ? 'active bg-light text-success' : 'text-dark'}`}
                to="/"
              >
                <i className="fas fa-home me-2"></i>Home
              </Link>
            </li>
            {isAuthenticated && (
              <>
                {
                  process.env.REACT_APP_SUPERADMIN == user.id ?
                    <li className="nav-item">
                      <Link
                        className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/upload') ? 'active bg-light text-success' : 'text-dark'}`}
                        to="/upload"
                      >
                        <i className="fas fa-cloud-upload-alt me-2"></i>Upload
                      </Link>
                    </li>
                    :
                    <></>
                }
                <li className="nav-item">
                  <Link
                    className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/news') ? 'active bg-light text-success' : 'text-dark'}`}
                    to="/news"
                  >
                    <i className="fas fa-newspaper me-2"></i>News
                  </Link>
                </li>
                {/* <li className="nav-item">
                  <Link
                    className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/context') ? 'active bg-light text-success' : 'text-dark'}`}
                    to="/context"
                  >
                    <i className="fas fa-lightbulb me-2"></i>Context
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/perspective') ? 'active bg-light text-success' : 'text-dark'}`}
                    to="/perspective"
                  >
                    <i className="fas fa-eye me-2"></i>Perspective
                  </Link>
                </li> */}
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <li className="nav-item dropdown position-relative">
                    <a
                      className="nav-link d-flex align-items-center px-3 py-2 rounded-pill bg-light text-dark fw-medium"
                      href="#"
                      role="button"
                      onClick={toggleDropdown}
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                        {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </div>
                      <span className="d-none d-md-inline">
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
                      </span>
                      <i className={`fas fa-chevron-down ms-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ fontSize: '12px' }}></i>
                    </a>
                    {dropdownOpen && (
                      <ul className="dropdown-menu dropdown-menu-end shadow border-0 show position-absolute"
                        style={{ top: '100%', right: '0', zIndex: 1000 }}>
                        <li>
                          <div className="dropdown-item-text">
                            <div className="fw-medium text-dark">{user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'}</div>
                            <small className="text-muted">{user?.email}</small>
                          </div>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <a className="dropdown-item d-flex align-items-center py-2" href="#" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt me-3 text-danger"></i>
                            <span>Sign Out</span>
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
                  <>
                    <li className="nav-item me-2">
                      <Link
                        className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/login') ? 'bg-success text-white' : 'text-dark border'}`}
                        to="/login"
                      >
                        <i className="fas fa-sign-in-alt me-2"></i>Sign In
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={`nav-link fw-medium px-3 py-2 rounded-pill ${isActive('/register') ? 'bg-success text-white' : 'bg-success text-white'}`}
                        to="/register"
                      >
                        <i className="fas fa-user-plus me-2"></i>Get Started
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
