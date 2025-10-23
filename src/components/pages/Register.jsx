import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, googleAuth } = useAuth();
  const navigate = useNavigate();

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

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
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
      navigate('/');
    } else {
      setErrors({ general: 'Google authentication failed' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="container">
        {/* Hero Section */}
        <div className="auth-hero">
          <h1>Join UPSC News</h1>
          <p>Create your account to start analyzing UPSC-relevant news with AI</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title text-center">Create Account</h2>
              
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                    {errors.first_name && (
                      <div className="invalid-feedback">
                        {Array.isArray(errors.first_name) ? errors.first_name[0] : errors.first_name}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                    {errors.last_name && (
                      <div className="invalid-feedback">
                        {Array.isArray(errors.last_name) ? errors.last_name[0] : errors.last_name}
                      </div>
                    )}
                  </div>
                </div>

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
                    minLength="8"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                    </div>
                  )}
                  <div className="form-text">
                    Password must be at least 8 characters long.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password_confirm" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                    id="password_confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                  />
                  {errors.password_confirm && (
                    <div className="invalid-feedback">
                      {Array.isArray(errors.password_confirm) ? errors.password_confirm[0] : errors.password_confirm}
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
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
                  Already have an account? <Link to="/login" className="text-decoration-none">Sign in</Link>
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

export default Register;
