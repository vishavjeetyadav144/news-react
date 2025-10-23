import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { newsAPI } from '../../services/api';
import { parseNewsDetailData } from '../../services/dataParser';
import { useAuth } from '../../contexts/AuthContext';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousArticle, setPreviousArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(1);
  const [totalArticles, setTotalArticles] = useState(1);
  const [relatedDrawerOpen, setRelatedDrawerOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch article detail from Django backend
        const response = await newsAPI.getNewsDetail(id);

        // Parse the HTML response to extract data
        const data = parseNewsDetailData(response);

        setArticle(data.article);
        setPreviousArticle(data.navigation.previous);
        setNextArticle(data.navigation.next);
        setCurrentPosition(data.navigation.current_position);
        setTotalArticles(data.navigation.total_articles);

      } catch (err) {
        console.error('Error fetching article detail:', err);
        setError(err.message);

        // Fallback to mock data on error
        const mockArticles = [
          {
            id: 1,
            headline: "Digital India Initiative: Transforming Governance Through Technology",
            news: "The Digital India programme has achieved significant milestones in digitizing government services and improving citizen access to public services. The initiative has successfully implemented various digital platforms including DigiLocker, e-Hospital, and Unified Payment Interface (UPI), revolutionizing how citizens interact with government services.",
            details: "The Digital India initiative, launched in 2015, represents one of the most ambitious digital transformation programs undertaken by any government globally. The program encompasses three key vision areas: Digital Infrastructure as a Core Utility, Governance and Services on Demand, and Digital Empowerment of Citizens.\n\nOver the past eight years, the initiative has achieved remarkable success in creating digital infrastructure. The JAM (Jan Dhan-Aadhaar-Mobile) trinity has become the backbone of India's digital economy, enabling direct benefit transfers worth over ₹25 lakh crores to beneficiaries. The Unified Payments Interface (UPI) has revolutionized digital payments, processing over 8 billion transactions monthly.\n\nThe governance transformation has been equally impressive. Services like DigiLocker have eliminated the need for physical documents, while platforms like e-Hospital have digitized healthcare services. The Common Service Centers (CSCs) have brought digital services to rural areas, serving as the last-mile delivery points for government services.\n\nHowever, challenges remain. The digital divide between urban and rural areas persists, with internet penetration and digital literacy varying significantly across regions. Cybersecurity concerns have also grown with increased digitization, requiring robust frameworks to protect citizen data and digital infrastructure.",
            topics: "GS Paper 2 - Governance, GS Paper 3 - Science and Technology, GS Paper 3 - Economy",
            prelims_point: "Digital India was launched in 2015 with the vision to transform India into a digitally empowered society and knowledge economy. Key components include JAM trinity (Jan Dhan-Aadhaar-Mobile), UPI, DigiLocker, e-Hospital, and Common Service Centers. The initiative aims to ensure digital infrastructure as a core utility, governance and services on demand, and digital empowerment of citizens.",
            tags: "Digital India, Technology, Governance, E-governance, UPI, JAM Trinity",
            last_updated: new Date('2024-01-15'),
            created_at: new Date('2024-01-15'),
            is_read: false,
            is_important: false,
            pinecone_id: "article_digital_india_2024_001"
          }
        ];

        const foundArticle = mockArticles.find(a => a.id === parseInt(id));
        if (foundArticle) {
          setArticle(foundArticle);
          setCurrentPosition(1);
          setTotalArticles(1);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleDetail();
    }
  }, [id]);

  const toggleReadStatus = async () => {
    try {
      const response = await newsAPI.toggleReadStatus(article.id);

      if (response.success) {
        setArticle(prev => ({ ...prev, is_read: response.is_read }));
        showNotification(response.message, 'success');
      } else {
        showNotification(response.message || 'Error updating read status', 'error');
      }
    } catch (err) {
      console.error('Error toggling read status:', err);
      // Fallback to local update
      setArticle(prev => ({ ...prev, is_read: !prev.is_read }));
      showNotification(
        article.is_read ? 'Article marked as unread (offline)' : 'Article marked as read (offline)',
        'warning'
      );
    }
  };

  const toggleImportantStatus = async () => {
    try {
      const response = await newsAPI.toggleImportantStatus(article.id);

      if (response.success) {
        setArticle(prev => ({ ...prev, is_important: response.is_important }));
        showNotification(response.message, 'success');
      } else {
        showNotification(response.message || 'Error updating important status', 'error');
      }
    } catch (err) {
      console.error('Error toggling important status:', err);
      // Fallback to local update
      setArticle(prev => ({ ...prev, is_important: !prev.is_important }));
      showNotification(
        article.is_important ? 'Removed from important articles (offline)' : 'Added to important articles (offline)',
        'warning'
      );
    }
  };

  const copyToClipboard = () => {
    const content = `Headline: ${article.headline}

    UPSC Topics: ${article.topics}

    Detailed Analysis:
    ${article.details}

    Prelims Points:
    ${article.prelims_point}

    Tags: ${article.tags}
    Last Updated: ${article.last_updated.toLocaleDateString()}`;

    navigator.clipboard.writeText(content).then(() => {
      showNotification('Article content copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy article content', 'error');
    });
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article.headline,
        text: article.details.substring(0, 200) + '...',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Article URL copied to clipboard!', 'success');
      });
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - in real app, you might use a toast library
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  };

  const openRelatedDrawer = () => {
    setRelatedDrawerOpen(true);
    document.body.style.overflow = 'hidden';
    loadRelatedArticles();
  };

  const closeRelatedDrawer = () => {
    setRelatedDrawerOpen(false);
    document.body.style.overflow = '';
  };

  const loadRelatedArticles = async () => {
    setRelatedLoading(true);
    setRelatedError(false);

    try {
      // Call the backend API to get related articles
      const response = await newsAPI.getRelatedArticles(id);

      if (response && response.related_articles) {
        setRelatedArticles(response.related_articles);
      } else {
        setRelatedArticles([]);
      }
    } catch (err) {
      console.error('Error loading related articles:', err);
      setRelatedError(true);

      // Fallback to empty array on error
      setRelatedArticles([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const splitTags = (tags) => {
    if (!tags) return [];
    return tags// tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  const splitTopics = (topics) => {
    if (!topics) return [];
    return topics // topics.split(',').map(topic => topic.trim()).filter(topic => topic);
  };

  const deleteArticle = async () => {

    try {
      const response = await newsAPI.deleteArticle(article.id);

      if (response.success) {
        showNotification('Article deleted successfully', 'success');
        // Navigate back to news list after successful deletion
        setTimeout(() => {
          navigate(`/news/${nextArticle.id}`);
        }, 500);
      } else {
        showNotification(response.message || 'Error deleting article', 'error');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      showNotification('Failed to delete article. Please try again.', 'error');
    }
  };

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

  const formatDateTime = (dateString) => {

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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-5">
        <h2>Article not found</h2>
        <p className="text-muted">The article you're looking for doesn't exist.</p>
        <Link to="/news" className="btn btn-primary">Back to All News</Link>
      </div>
    );
  }

  return (
    <div className="article-container">
      {/* Article Header */}
      <header className="article-header mb-5">
        <div className="article-breadcrumb mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/news" className="text-decoration-none">All News</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Article</li>
            </ol>
          </nav>
        </div>

        <h1 className="article-headline">{article.headline}</h1>

        <div className="article-meta d-flex align-items-center gap-4 mb-4">
          <div style={{ gap: "20px", display: "flex" }}>

            <div className="meta-item">
              <i className="fas fa-calendar-alt me-2 text-muted"></i>
              <span className="text-muted">{formatDate(article.last_updated)}</span>
            </div>
            <div className="meta-item">
              <span className="badge bg-light text-dark">{currentPosition} of {totalArticles}</span>
            </div>
          </div>

          <div style={{ gap: "15px", display: "flex" }}>
            <div className="meta-item">
              <button
                className={`btn btn-sm read-status-btn ${article.is_read ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={toggleReadStatus}
              >
                {article.is_read ? (
                  <>
                    <i className="fas fa-check-circle me-1"></i>Read
                  </>
                ) : (
                  <>
                    <i className="fas fa-circle me-1"></i>Mark as Read
                  </>
                )}
              </button>
            </div>
            <div className="meta-item">
              <button
                className={`btn btn-sm important-status-btn ${article.is_important ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={toggleImportantStatus}
              >
                <i className="fas fa-star me-1"></i>
                {article.is_important ? 'Important' : 'Mark as Important'}
              </button>
            </div>
            <div className="meta-item">
              <button
                className="btn btn-sm btn-outline-primary related-articles-btn"
                onClick={openRelatedDrawer}
              >
                <i className="fas fa-search me-1"></i>Related Articles
              </button>
            </div>

          </div>
        </div>

        {/* Tags */}
        <div className="article-tags mb-4">
          {splitTags(article.tags).map((tag, index) => (
            <Link
              key={index}
              to={`/news?tag=${encodeURIComponent(tag)}`}
              className="tag-badge me-2 mb-2"
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>

      <div className="row">
        {/* Main Article Content */}
        <div className="col-lg-8">
          <article className="article-content">
            {/* News Summary */}
            {article.news && (
              <div className="content-section mb-5">
                <h3 className="section-heading">
                  <i className="fas fa-newspaper text-info me-2"></i>News Summary
                </h3>
                <div className="news-summary">
                  {article.news.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* UPSC Topics */}
            {article.topics && (
              <div className="content-section mb-5">
                <h3 className="section-heading">
                  <i className="fas fa-bookmark text-primary me-2"></i>UPSC Topics
                </h3>
                <div className="topics-grid">
                  {splitTopics(article.topics).map((topic, index) => (
                    <span key={index} className="topic-badge">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Analysis */}
            <div className="content-section mb-5">
              <h3 className="section-heading">
                <i className="fas fa-newspaper text-primary me-2"></i>Detailed Analysis
              </h3>
              <div className="analysis-content">
                {article.details.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Prelims Points */}
            <div className="content-section mb-5">
              <h3 className="section-heading">
                <i className="fas fa-lightbulb text-warning me-2"></i>Prelims Points
              </h3>
              <div className="prelims-content">
                {article.prelims_point.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Article Actions */}
            {
              isAuthenticated && process.env.REACT_APP_SUPERADMIN == user.id ?

                <div className="article-actions mb-5">
                  <button className="btn btn-outline-primary me-3" onClick={copyToClipboard}>
                    <i className="fas fa-copy me-2"></i>Copy Article
                  </button>
                  <button className="btn btn-outline-success me-3" onClick={shareArticle}>
                    <i className="fas fa-share me-2"></i>Share
                  </button>
                  <button className="btn btn-outline-danger" onClick={deleteArticle}>
                    <i className="fas fa-trash me-2"></i>Delete Article
                  </button>
                </div>
                :
                <div className="article-actions mb-5">
                  <button className="btn btn-outline-primary me-3" onClick={copyToClipboard}>
                    <i className="fas fa-copy me-2"></i>Copy Article
                  </button>
                  <button className="btn btn-outline-success me-3" onClick={shareArticle}>
                    <i className="fas fa-share me-2"></i>Share
                  </button>
                </div>
            }
          </article>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <aside className="article-sidebar">
            {/* Navigation */}
            <div className="sidebar-section mb-4">
              <h4 className="sidebar-heading">Navigation</h4>
              <div className="nav-controls">
                {previousArticle && (
                  <Link
                    to={`/news/${previousArticle.id}`}
                    className="nav-link-card mb-3"
                  >
                    <div className="nav-direction">
                      <i className="fas fa-chevron-left me-2"></i>Previous
                    </div>
                    <div className="nav-title">
                      {previousArticle.headline.length > 60
                        ? previousArticle.headline.substring(0, 60) + '...'
                        : previousArticle.headline
                      }
                    </div>
                  </Link>
                )}

                {nextArticle && (
                  <Link
                    to={`/news/${nextArticle.id}`}
                    className="nav-link-card"
                  >
                    <div className="nav-direction">
                      Next<i className="fas fa-chevron-right ms-2"></i>
                    </div>
                    <div className="nav-title">
                      {nextArticle.headline.length > 60
                        ? nextArticle.headline.substring(0, 60) + '...'
                        : nextArticle.headline
                      }
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Study Tips */}
            <div className="sidebar-section mb-4">
              <h4 className="sidebar-heading">Study Tips</h4>
              <div className="study-tips">
                <div className="tip-item mb-3">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <div>
                    <strong>Make Notes:</strong>
                    <small className="d-block text-muted">Create concise notes for quick revision</small>
                  </div>
                </div>
                <div className="tip-item mb-3">
                  <i className="fas fa-link text-info me-2"></i>
                  <div>
                    <strong>Connect Topics:</strong>
                    <small className="d-block text-muted">Link with other GS papers and current affairs</small>
                  </div>
                </div>
                <div className="tip-item mb-3">
                  <i className="fas fa-question-circle text-warning me-2"></i>
                  <div>
                    <strong>Frame Questions:</strong>
                    <small className="d-block text-muted">Think of potential exam questions</small>
                  </div>
                </div>
                <div className="tip-item">
                  <i className="fas fa-clock text-primary me-2"></i>
                  <div>
                    <strong>Stay Updated:</strong>
                    <small className="d-block text-muted">Follow recent developments on this topic</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Info */}
            <div className="sidebar-section">
              <h4 className="sidebar-heading">Article Info</h4>
              <div className="article-info">
                <div className="info-item mb-2">
                  <strong>Created:</strong>
                  <span className="text-muted">{formatDateTime(article.created_at)}</span>
                </div>
                <div className="info-item mb-2">
                  <strong>Last Updated:</strong>
                  <span className="text-muted">{formatDateTime(article.last_updated)}</span>
                </div>
                {/* <div className="info-item">
                  <strong>ID:</strong>
                  <small className="text-muted font-monospace">
                    {article.pinecone_id.length > 20 
                      ? article.pinecone_id.substring(0, 20) + '...'
                      : article.pinecone_id
                    }
                  </small>
                </div> */}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles Side Drawer */}
      <div className={`related-drawer ${relatedDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-overlay" onClick={closeRelatedDrawer}></div>
        <div className="drawer-content">
          <div className="drawer-header">
            <h2 className="drawer-title">
              <i className="fas fa-search me-2"></i>Related Articles
            </h2>
            <button className="btn-close-drawer" onClick={closeRelatedDrawer}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="drawer-body">
            {relatedLoading && (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
                <p className="text-muted">Finding related articles...</p>
              </div>
            )}

            {relatedError && (
              <div className="text-center py-4">
                <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                <p className="text-muted">Unable to load related articles</p>
                <button className="btn btn-outline-primary btn-sm" onClick={loadRelatedArticles}>
                  <i className="fas fa-refresh me-1"></i>Try Again
                </button>
              </div>
            )}

            {!relatedLoading && !relatedError && relatedArticles.length === 0 && (
              <div className="text-center py-4">
                <i className="fas fa-info-circle fa-2x text-info mb-3"></i>
                <p className="text-muted">No related articles found</p>
              </div>
            )}

            {!relatedLoading && !relatedError && relatedArticles.length > 0 && (
              <div>
                <div className="results-header mb-3">
                  <small className="text-success fw-semibold">
                    <i className="fas fa-check-circle me-1"></i>
                    {relatedArticles.length} Related Articles Found
                  </small>
                </div>
                <div>
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="related-article-card mb-3">
                      <Link
                        to={`/news/${relatedArticle.id}`}
                        className="text-decoration-none"
                        onClick={closeRelatedDrawer}
                      >
                        <div className="related-article-content">
                          <h6 className="related-article-title mb-2">{relatedArticle.headline}</h6>
                          {relatedArticle.news && (
                            <p className="related-article-summary mb-2">
                              {relatedArticle.news.length > 120
                                ? relatedArticle.news.substring(0, 120) + '...'
                                : relatedArticle.news
                              }
                            </p>
                          )}
                          <div className="related-article-meta">
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              {formatDate(relatedArticle.last_updated)}
                              <span className="similarity-score ms-2">
                                <i className="fas fa-chart-line me-1"></i>
                                {Math.round(relatedArticle.similarity_score * 100)}% match
                              </span>
                            </small>
                          </div>
                          <div className="related-article-tags mt-2">
                            {splitTags(relatedArticle.tags).slice(0, 3).map((tag, index) => (
                              <span key={index} className="related-tag-badge">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
