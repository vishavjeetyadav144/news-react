import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeAPI } from '../../services/api';
import { parseHomePageData } from '../../services/dataParser';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from Django backend
        const response = await homeAPI.getHomeData();
        
        // Parse the HTML response to extract data
        const data = parseHomePageData(response);
        console.log(data)
        setNewsArticles(data.news_articles || []);
        setTotalArticles(data.total_articles || 0);
        
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err.message);
        
        // Fallback to mock data on error
        setNewsArticles([
          {
            id: 1,
            headline: "Digital India Initiative: Transforming Governance Through Technology",
            news: "The Digital India programme has achieved significant milestones in digitizing government services and improving citizen access to public services.",
            details: "The initiative has successfully implemented various digital platforms including DigiLocker, e-Hospital, and Unified Payment Interface (UPI), revolutionizing how citizens interact with government services.",
            tags: "Digital India, Technology, Governance, E-governance",
            topics: "GS Paper 2 - Governance, GS Paper 3 - Science and Technology",
            prelims_point: "Digital India was launched in 2015 with the vision to transform India into a digitally empowered society and knowledge economy.",
            last_updated: new Date('2024-01-15'),
            is_read: false
          },
          {
            id: 2,
            headline: "Climate Change Policy: India's Commitment to Net Zero by 2070",
            news: "India has announced ambitious climate targets including achieving net-zero emissions by 2070 and increasing renewable energy capacity.",
            details: "The policy framework includes massive investments in solar and wind energy, electric vehicle adoption, and sustainable development practices across various sectors.",
            tags: "Climate Change, Environment, Renewable Energy, Net Zero",
            topics: "GS Paper 3 - Environment, GS Paper 2 - International Relations",
            prelims_point: "India committed to net-zero emissions by 2070 at COP26 in Glasgow, making it one of the most ambitious climate targets globally.",
            last_updated: new Date('2024-01-14'),
            is_read: true
          }
        ]);
        setTotalArticles(2);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // const formatDate = (date) => {
  //   return date.toLocaleDateString('en-US', { 
  //     year: 'numeric', 
  //     month: 'short', 
  //     day: 'numeric' 
  //   });
  // };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if date is invalid
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString; // Return original string if formatting fails
    }
  };

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
        
        {
          isAuthenticated && process.env.REACT_APP_SUPERADMIN == user.id ?
          <div className="hero-actions">
            <Link to="/upload" className="btn btn-primary btn-lg me-3">
              <i className="fas fa-upload me-2"></i>Upload PDF
            </Link>
            <Link to="/news" className="btn btn-outline-secondary btn-lg">
              <i className="fas fa-list me-2"></i>Browse All News
            </Link>
          </div>
          :
          <></>
        }
      </div>

      {/* Featured News Section */}
      <div>
      {newsArticles.length > 0 ? (
        <div className="featured-section mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title">Latest News</h2>
            <Link to="/news" className="text-decoration-none">
              View all <i className="fas fa-arrow-right ms-1"></i>
            </Link>
          </div>
          
          <div className="row">
            {newsArticles.map((article) => (
              <div key={article.id} className="col-lg-6 mb-4">
                <article className="news-card fade-in">
                  <div className="article-meta mb-2">
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      {formatDate(article.last_updated)}
                    </small>
                  </div>
                  
                  <h3 className="article-title mb-3">
                    <Link 
                      to={`/news/${article.id}`} 
                      className="text-decoration-none text-dark"
                    >
                      {truncateText(article.headline, 120)}
                    </Link>
                  </h3>
                  
                  {/* News Summary */}
                  {article.news && (
                    <div className="news-summary-preview mb-3">
                      <small className="text-info fw-semibold d-block mb-1">
                        <i className="fas fa-newspaper me-1"></i>News Summary:
                      </small>
                      <p className="small text-dark mb-0">
                        {truncateText(article.news, 150)}
                      </p>
                    </div>
                  )}
                  
                  <p className="article-excerpt text-muted mb-3">
                    {truncateText(article.details, 180)}
                  </p>
                  
                  {/* Tags */}
                  <div className="article-tags mb-3">
                    {splitTags(article.tags).map((tag, index) => (
                      <Link
                        key={index}
                        to={`/news?tag=${encodeURIComponent(tag)}`}
                        className="tag-badge"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  
                  {/* Topics */}
                  {article.topics && (
                    <div className="article-topics mb-3">
                      <small className="text-primary fw-semibold d-block mb-2">
                        <i className="fas fa-bookmark me-1"></i>UPSC Topics:
                      </small>
                      {splitTags(article.topics).map((topic, index) => (
                        <span key={index} className="badge bg-light text-dark me-2 mb-1">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Prelims Point Preview */}
                  <div className="prelims-preview mb-3">
                    <small className="text-warning fw-semibold d-block mb-1">
                      <i className="fas fa-lightbulb me-1"></i>Prelims Point:
                    </small>
                    <p className="small text-muted mb-0">
                      {truncateText(article.prelims_point, 100)}
                    </p>
                  </div>
                  
                  <div className="article-footer d-flex justify-content-between align-items-center">
                    <Link to={`/news/${article.id}`} className="btn btn-gradient btn-sm">
                      Read More <i className="fas fa-arrow-right ms-1"></i>
                    </Link>
                    <small className="text-muted">
                      {getTimeSince(article.last_updated)} ago
                    </small>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state text-center py-5">
          <div className="empty-icon mb-4">
            <i className="fas fa-newspaper fa-4x text-muted"></i>
          </div>
          <h3 className="mb-3">No News Articles Yet</h3>
          <p className="text-muted mb-4">
            Start by uploading your first newspaper PDF to extract UPSC-relevant news articles.
          </p>
          <Link to="/upload" className="btn btn-primary btn-lg">
            <i className="fas fa-upload me-2"></i>Upload Your First PDF
          </Link>
        </div>
      )}
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
