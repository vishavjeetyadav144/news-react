import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { newsAPI } from '../../services/api';
import { parseNewsListData } from '../../services/dataParser';

const NewsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newsArticles, setNewsArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [allTopics, setAllTopics] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '');
  const [topicFilter, setTopicFilter] = useState(searchParams.get('topic') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [readStatus, setReadStatus] = useState(searchParams.get('read_status') || '');
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('per_page')) || 6);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (tagFilter) params.tag = tagFilter;
        if (topicFilter) params.topic = topicFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (readStatus) params.read_status = readStatus;
        if (perPage !== 6) params.per_page = perPage;
        
        // Fetch data from Django backend
        const response = await newsAPI.getNews(params);
        
        // Parse the HTML response to extract data
        const data = parseNewsListData(response);
        
        setNewsArticles(data.news_articles || []);
        setTotalArticles(data.total_articles || 0);
        setAllTopics(data.filters.all_topics || []);
        setSearchQuery(data.filters.applied_filters.search)
        setTopicFilter(data.filters.applied_filters.topic)
        setReadStatus(data.filters.applied_filters.read_status)
        setDateTo(data.filters.applied_filters.date_to)
        setTagFilter(data.filters.applied_filters.tag)
        setDateFrom(data.filters.applied_filters.date_from)
        
      } catch (err) {
        console.error('Error fetching news data:', err);
        setError(err.message);
        
        // Fallback to mock data on error
        const mockArticles = [
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
        ];
        
        setNewsArticles(mockArticles);
        setTotalArticles(mockArticles.length);
        setAllTopics([
          "GS Paper 1 - History",
          "GS Paper 2 - Governance",
          "GS Paper 3 - Economy",
          "GS Paper 3 - Environment"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [searchQuery, tagFilter, topicFilter, dateFrom, dateTo, readStatus, perPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (tagFilter) params.set('tag', tagFilter);
    if (topicFilter) params.set('topic', topicFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (readStatus) params.set('read_status', readStatus);
    if (perPage !== 6) params.set('per_page', perPage.toString());
    
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTagFilter('');
    setTopicFilter('');
    setDateFrom('');
    setDateTo('');
    setReadStatus('');
    setSearchParams({});
  };

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchQuery('');
        break;
      case 'tag':
        setTagFilter('');
        break;
      case 'topic':
        setTopicFilter('');
        break;
      case 'date_from':
        setDateFrom('');
        break;
      case 'date_to':
        setDateTo('');
        break;
      case 'read_status':
        setReadStatus('');
        break;
    }
    setTimeout(updateSearchParams, 0);
  };

  const toggleSelectAll = () => {
    if (selectedArticles.size === newsArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(newsArticles.map(article => article.id)));
    }
  };

  const toggleArticleSelection = (articleId) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const toggleReadStatus = (articleId) => {
    setNewsArticles(articles => 
      articles.map(article => 
        article.id === articleId 
          ? { ...article, is_read: !article.is_read }
          : article
      )
    );
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

  const getTimeSince = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } catch (error) {
      console.warn('Error calculating time since:', dateString, error);
      return 'Unknown';
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const splitTags = (tags) => {
    return tags;
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
      {/* Page Header */}
      <div className="page-header mb-5">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="page-title">All News Articles</h1>
            <p className="page-subtitle text-muted">
              {totalArticles} articles available for UPSC preparation
            </p>
          </div>
          <div className="header-actions">
            <Link to="/upload" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>Add More
            </Link>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="search-filters-section">
          <form onSubmit={handleSearch}>
            <div className="row align-items-center mb-3">
              <div className="col-md-4">
                <div className="search-container">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-gradient">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-8 text-md-end mt-3 mt-md-0">
                <div className="d-flex align-items-center justify-content-md-end flex-wrap gap-2">
                  <div className="per-page-selector">
                    <label className="form-label small fw-semibold me-2 mb-0">Per page:</label>
                    <select 
                      className="form-select form-select-sm" 
                      style={{width: 'auto', display: 'inline-block'}}
                      value={perPage}
                      onChange={(e) => setPerPage(parseInt(e.target.value))}
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={toggleSelectAll}
                  >
                    <i className="fas fa-check-square me-1"></i>Select All
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <i className="fas fa-filter me-1"></i>Advanced Filters
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearAllFilters}
                  >
                    <i className="fas fa-refresh me-1"></i>Clear All
                  </button>
                </div>
              </div>
            </div>
            
            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="advanced-filters">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Date From</label>
                    <input 
                      type="date" 
                      className="form-control form-control-sm"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Date To</label>
                    <input 
                      type="date" 
                      className="form-control form-control-sm"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Topic</label>
                    <select 
                      className="form-select form-select-sm"
                      value={topicFilter}
                      onChange={(e) => setTopicFilter(e.target.value)}
                    >
                      <option value="">All Topics</option>
                      {allTopics.map((topic, index) => (
                        <option key={index} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Read Status</label>
                    <select 
                      className="form-select form-select-sm"
                      value={readStatus}
                      onChange={(e) => setReadStatus(e.target.value)}
                    >
                      <option value="">All Articles</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
          
          {/* Active Filters */}
          {(searchQuery || tagFilter || topicFilter || dateFrom || dateTo || readStatus) && (
            <div className="active-filters mt-3">
              {searchQuery && (
                <div className="filter-tag">
                  <i className="fas fa-search me-1"></i>
                  Search: "{searchQuery}"
                  <button 
                    className="filter-remove"
                    onClick={() => removeFilter('search')}
                  >×</button>
                </div>
              )}
              {tagFilter && (
                <div className="filter-tag">
                  <i className="fas fa-tag me-1"></i>
                  Tag: {tagFilter}
                  <button 
                    className="filter-remove"
                    onClick={() => removeFilter('tag')}
                  >×</button>
                </div>
              )}
              {topicFilter && (
                <div className="filter-tag">
                  <i className="fas fa-bookmark me-1"></i>
                  Topic: {topicFilter}
                  <button 
                    className="filter-remove"
                    onClick={() => removeFilter('topic')}
                  >×</button>
                </div>
              )}
              {readStatus && (
                <div className="filter-tag">
                  <i className="fas fa-eye me-1"></i>
                  Status: {readStatus}
                  <button 
                    className="filter-remove"
                    onClick={() => removeFilter('read_status')}
                  >×</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedArticles.size > 0 && (
        <div className="bulk-actions">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="fas fa-check-circle me-2"></i>
              {selectedArticles.size} articles selected
            </div>
            <div>
              <button className="btn btn-outline-light btn-sm me-2">
                <i className="fas fa-trash me-1"></i>Delete Selected
              </button>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => setSelectedArticles(new Set())}
              >
                <i className="fas fa-times me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {newsArticles.length > 0 ? (
        <div className="articles-grid">
          {newsArticles.map((article) => (
            <article 
              key={article.id} 
              className={`article-card fade-in ${article.is_read ? 'article-read' : ''}`}
            >
              {/* Selection Checkbox */}
              <input 
                type="checkbox" 
                className="article-checkbox"
                checked={selectedArticles.has(article.id)}
                onChange={() => toggleArticleSelection(article.id)}
              />
              
              {/* Article Actions */}
              <div className="card-actions">
                <button 
                  className="btn btn-sm btn-outline-secondary btn-action"
                  onClick={() => toggleReadStatus(article.id)}
                  title={article.is_read ? "Mark as Unread" : "Mark as Read"}
                >
                  <i className={`fas ${article.is_read ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary btn-action"
                  title="Edit Tags"
                >
                  <i className="fas fa-tags"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger btn-action"
                  title="Delete Article"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>

              {/* Article Content */}
              <div className="article-meta mb-2">
                <small className="text-muted">
                  <i className="fas fa-clock me-1"></i>
                  {formatDate(article.last_updated)}
                  {article.is_read && (
                    <span className="read-badge ms-2">
                      <i className="fas fa-check me-1"></i>Read
                    </span>
                  )}
                </small>
              </div>
              
              <h3 className="article-title mb-3">
                <Link 
                  to={`/news/${article.id}`} 
                  className="text-decoration-none text-dark"
                >
                  {truncateText(article.headline, 100)}
                </Link>
              </h3>
              
              {/* News Summary */}
              {article.news && (
                <div className="news-summary-preview mb-3">
                  <small className="text-info fw-semibold d-block mb-1">
                    <i className="fas fa-newspaper me-1"></i>News Summary:
                  </small>
                  <p className="small text-dark mb-0">
                    {truncateText(article.news, 50)}
                  </p>
                </div>
              )}
              
              <p className="article-excerpt text-muted mb-3">
                {truncateText(article.details, 50)}
              </p>
              
              {/* Tags */}
              <div className="article-tags mb-3">
                <div className="editable-tags">
                  {splitTags(article.tags).map((tag, index) => (
                    <Link
                      key={index}
                      to={`/news?tag=${encodeURIComponent(tag)}`}
                      className="tag-badge me-1 mb-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tag}
                    </Link>
                  ))}
                  <i className="fas fa-edit text-muted ms-1" style={{fontSize: '0.75rem'}}></i>
                </div>
              </div>

              {/* Topics */}
              {article.topics && (
                <div className="article-topics mb-3">
                  <small className="text-primary fw-semibold d-block mb-2">
                    <i className="fas fa-bookmark me-1"></i>UPSC Topics:
                  </small>
                  <div className="topics-list">
                    {splitTags(article.topics).map((topic, index) => (
                      <span key={index} className="topic-badge me-1 mb-1">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Prelims Point Preview */}
              <div className="prelims-preview mb-3">
                <small className="text-warning fw-semibold d-block mb-1">
                  <i className="fas fa-lightbulb me-1"></i>Prelims Point:
                </small>
                <p className="small text-muted mb-0">
                  {truncateText(article.prelims_point, 50)}
                </p>
              </div>
              
              {/* Article Footer */}
              <div className="article-footer d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {getTimeSince(article.last_updated)} ago
                </small>
                <Link to={`/news/${article.id}`} className="btn btn-gradient btn-sm">
                  Read More <i className="fas fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state text-center py-5">
          <div className="empty-icon mb-4">
            {searchQuery ? (
              <i className="fas fa-search fa-4x text-muted"></i>
            ) : (
              <i className="fas fa-newspaper fa-4x text-muted"></i>
            )}
          </div>
          <h3 className="mb-3">
            {searchQuery ? 'No articles found' : 'No articles yet'}
          </h3>
          <p className="text-muted mb-4">
            {searchQuery ? (
              <>
                Try a different search term or{' '}
                <button 
                  className="btn btn-link p-0"
                  onClick={clearAllFilters}
                >
                  view all articles
                </button>
              </>
            ) : (
              'Upload some PDFs to get started!'
            )}
          </p>
          {!searchQuery && (
            <Link to="/upload" className="btn btn-primary btn-lg">
              <i className="fas fa-upload me-2"></i>Upload PDF
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsList;
