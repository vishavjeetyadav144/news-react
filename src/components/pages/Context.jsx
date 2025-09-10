import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contextAPI } from '../../services/api';
import { parseContextData } from '../../services/dataParser';

const Context = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingContexts, setExistingContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContextData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch context data from Django backend
        const response = await contextAPI.getContexts();
        
        // Parse the HTML response to extract data
        const data = parseContextData(response);
        setExistingContexts(data.contexts || []);

      } catch (err) {
        console.error('Error fetching context data:', err);
        setError(err.message);

        // Fallback to mock data on error
        setExistingContexts([
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContextData();
  }, []);

  const exampleTopics = [
    'Digital India Initiative',
    'Climate Change Policy',
    'GST Implementation',
    'Make in India'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);

    try {
      // Generate new context using Django backend
      await contextAPI.generateContext(topic);

      // Refresh the contexts list
      const response = await contextAPI.getContexts();
      const data = parseContextData(response);
      setExistingContexts(data.existing_contexts || []);

      setTopic('');

      // Show success message
      const notification = document.createElement('div');
      notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
      notification.innerHTML = `
        Context for "${topic}" has been generated successfully!
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 3000);

    } catch (err) {
      console.error('Error generating context:', err);

      // Fallback to mock generation on error
      const newContext = {
        id: existingContexts.length + 1,
        topic: topic,
        summary: `Comprehensive 5-year background analysis of ${topic}, examining historical developments, policy evolution, key milestones, challenges faced, and current status with implications for UPSC preparation.`,
        created_at: new Date()
      };

      setExistingContexts([newContext, ...existingContexts]);
      setTopic('');

      // Show error message
      const notification = document.createElement('div');
      notification.className = 'alert alert-warning alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
      notification.innerHTML = `
        Using offline mode. Context generated locally.
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const setExampleTopic = (exampleTopic) => {
    setTopic(exampleTopic);
  };

  const toggleBookmark = (e) => {
    e.stopPropagation();
    const icon = e.currentTarget.querySelector('i');
    if (icon.classList.contains('fas')) {
      icon.classList.remove('fas');
      icon.classList.add('far');
    } else {
      icon.classList.remove('far');
      icon.classList.add('fas');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Topic Header Section */}
      <div className="topic-header">
        <h1 className="topic-title">5-Year Context</h1>
        <div className="topic-meta">
          <span><i className="fas fa-tag"></i> Topic</span>
          <span>•</span>
          <span>{existingContexts.length} analyses</span>
          <span>•</span>
          <span>Historical Background</span>
        </div>
        {/* <button className="follow-btn">Follow</button> */}
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="text"
                className="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Digital India Initiative, Climate Change Policy, GST Implementation..."
                required
                disabled={isGenerating}
              />
              <button
                type="submit"
                className="generate-btn"
                disabled={isGenerating || !topic.trim()}
              >
                {isGenerating && (
                  <span className="loading-spinner"></span>
                )}
                {isGenerating ? 'Generating...' : 'Generate Analysis'}
              </button>
            </div>

            <div className="example-topics">
              {exampleTopics.map((exampleTopic, index) => (
                <button
                  key={index}
                  type="button"
                  className="example-topic"
                  onClick={() => setExampleTopic(exampleTopic)}
                  disabled={isGenerating}
                >
                  {exampleTopic}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      <div className="main-container">
        {/* Input Section */}


        {/* Articles Grid */}
        <div className="articles-grid">
          {existingContexts.length > 0 ? (
            existingContexts.map((content, index) => (
              <article
                key={content.id}
                className="article-card"
                onClick={() => window.location.href = `/context/${content.id}`}
              >
                <div className="article-image">
                  <img className="fas fa-history" src={content.image_url}></img>
                </div>

                <div className="article-content">
                  <div className="article-author">
                    <div className="author-avatar">AI</div>
                    <span>In 5-Year Context by AI Analysis</span>
                  </div>

                  <h2 className="article-title">{content.topic}</h2>

                  {content.content.summary && (
                    <p className="article-summary">
                      {content.content.summary.length > 150
                        ? content.content.summary.substring(0, 150) + '...'
                        : content.content.summary
                      }
                    </p>
                  )}

                  <div className="article-meta">
                    <div className="article-date">
                      <i className="fas fa-star"></i>
                      {formatDate(content.created_at)}
                    </div>

                    {/* <div className="article-stats">
                      <div className="stat-item">
                        <i className="fas fa-eye"></i>
                        <span>{45 + index}</span>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-comment"></i>
                        <span>{2 + index}</span>
                      </div>
                      <button className="bookmark-btn" onClick={toggleBookmark}>
                        <i className="fas fa-bookmark"></i>
                      </button>
                    </div> */}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <i className="fas fa-file-alt"></i>
              <h3>No analyses yet</h3>
              <p>Start by entering a topic above to generate your first 5-year background analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Context;
