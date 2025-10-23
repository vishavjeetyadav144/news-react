import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state, default to home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      if (result.error.non_field_errors) {
        setErrors({ general: result.error.non_field_errors[0] });
      } else {
        setErrors(result.error);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // Initialize Google OAuth
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback
    });
    
    window.google.accounts.id.prompt();
  };

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    const result = await googleAuth(response.credential);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({ general: 'Google authentication failed' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="container">
        {/* Hero Section */}

        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title text-center">Sign In</h2>
              
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="text-center mb-3">
                <span className="text-muted">or</span>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger w-100 mb-3"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <i className="fab fa-google me-2"></i>
                Continue with Google
              </button>

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account? <Link to="/register" className="text-decoration-none">Sign up</Link>
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
