import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeAPI } from '../../services/api';
import { parseHomePageData } from '../../services/dataParser';

const Home = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from Django backend
        const response = await homeAPI.getHomeData();
        
        // Parse the HTML response to extract data
        const data = parseHomePageData(response);
        
        setTotalArticles(data.total_articles || 0);
        
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err.message);

      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  

  const getTimeSince = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const splitTags = (tags) => {
    return tags //tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">UPSC News Analysis</h1>
        <p className="lead text-muted mb-4">
          AI-powered extraction and analysis of UPSC-relevant news from newspaper PDFs
        </p>
        
        <div className="hero-stats d-flex justify-content-center gap-4 mb-4">
          <div className="stat-item">
            <h3 className="text-primary mb-1">{totalArticles}</h3>
            <small className="text-muted">Articles Processed</small>
          </div>
          <div className="stat-item">
            <h3 className="text-primary mb-1">AI</h3>
            <small className="text-muted">Powered Analysis</small>
          </div>
          <div className="stat-item">
            <h3 className="text-primary mb-1">24/7</h3>
            <small className="text-muted">Updated</small>
          </div>
        </div>
        
        <div className="hero-actions">
          <Link to="/upload" className="btn btn-primary btn-lg me-3">
            <i className="fas fa-upload me-2"></i>Upload PDF
          </Link>
          <Link to="/news" className="btn btn-outline-secondary btn-lg">
            <i className="fas fa-list me-2"></i>Browse All News
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section mt-5 pt-5 border-top">
        <h2 className="text-center mb-5">How It Works</h2>
        <div className="row">
          <div className="col-md-3 text-center mb-4">
            <div className="step-icon mb-3">
              <i className="fas fa-upload fa-2x text-primary"></i>
            </div>
            <h5 className="mb-2">1. Upload</h5>
            <p className="text-muted small">Upload newspaper PDF files from trusted sources</p>
          </div>
          <div className="col-md-3 text-center mb-4">
            <div className="step-icon mb-3">
              <i className="fas fa-robot fa-2x text-primary"></i>
            </div>
            <h5 className="mb-2">2. AI Analysis</h5>
            <p className="text-muted small">AI extracts and analyzes UPSC-relevant content</p>
          </div>
          <div className="col-md-3 text-center mb-4">
            <div className="step-icon mb-3">
              <i className="fas fa-tags fa-2x text-primary"></i>
            </div>
            <h5 className="mb-2">3. Categorize</h5>
            <p className="text-muted small">Automatic tagging by GS papers and topics</p>
          </div>
          <div className="col-md-3 text-center mb-4">
            <div className="step-icon mb-3">
              <i className="fas fa-search fa-2x text-primary"></i>
            </div>
            <h5 className="mb-2">4. Study</h5>
            <p className="text-muted small">Search, filter, and study organized content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
