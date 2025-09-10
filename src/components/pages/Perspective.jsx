import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { perspectiveAPI } from '../../services/api';
import { parsePerspectiveData } from '../../services/dataParser';

const Perspective = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPerspectives, setExistingPerspectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerspectiveData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch perspective data from Django backend
        const response = await perspectiveAPI.getPerspectives();
        
        // Parse the HTML response to extract data
        const data = parsePerspectiveData(response);
        
        setExistingPerspectives(data.existing_perspectives || []);
        
      } catch (err) {
        console.error('Error fetching perspective data:', err);
        setError(err.message);
        
        // Fallback to mock data on error
        setExistingPerspectives([
          {
            id: 1,
            topic: 'Nuclear Energy in India',
            summary: 'Comprehensive analysis examining arguments for nuclear energy as clean baseload power versus concerns about safety, waste disposal, and high costs. Covers policy implications, international agreements, and public opinion.',
            created_at: new Date('2024-01-12')
          },
          {
            id: 2,
            topic: 'Reservation Policy',
            summary: 'Balanced perspective on reservation system in India, analyzing arguments for social justice and representation against concerns about merit and reverse discrimination. Examines constitutional provisions and recent developments.',
            created_at: new Date('2024-01-09')
          },
          {
            id: 3,
            topic: 'Cryptocurrency Regulation',
            summary: 'For/against analysis of cryptocurrency regulation in India, covering innovation and financial inclusion benefits versus concerns about monetary policy, illegal activities, and financial stability.',
            created_at: new Date('2024-01-06')
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerspectiveData();
  }, []);

  const exampleTopics = [
    'Nuclear Energy in India',
    'Reservation Policy',
    'Cryptocurrency Regulation',
    'Capital Punishment'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    
    try {
      // Generate new perspective using Django backend
      await perspectiveAPI.generatePerspective(topic);
      
      // Refresh the perspectives list
      const response = await perspectiveAPI.getPerspectives();
      const data = parsePerspectiveData(response);
      setExistingPerspectives(data.existing_perspectives || []);
      
      setTopic('');
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
      notification.innerHTML = `
        Perspective for "${topic}" has been generated successfully!
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 3000);
      
    } catch (err) {
      console.error('Error generating perspective:', err);
      
      // Fallback to mock generation on error
      const newPerspective = {
        id: existingPerspectives.length + 1,
        topic: topic,
        summary: `Comprehensive perspective analysis of ${topic}, examining arguments both for and against the topic, analyzing different stakeholder viewpoints, policy implications, and balanced assessment for UPSC preparation.`,
        created_at: new Date()
      };
      
      setExistingPerspectives([newPerspective, ...existingPerspectives]);
      setTopic('');
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'alert alert-warning alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
      notification.innerHTML = `
        Using offline mode. Perspective generated locally.
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
        <h1 className="topic-title">Perspective Analysis</h1>
        <div className="topic-meta">
          <span><i className="fas fa-tag"></i> Topic</span>
          <span>•</span>
          <span>{existingPerspectives.length} analyses</span>
          <span>•</span>
          <span>For/Against Arguments</span>
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
                placeholder="e.g., Nuclear Energy in India, Reservation Policy, Cryptocurrency Regulation..."
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
                {isGenerating ? 'Analyzing...' : 'Generate Analysis'}
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
          {existingPerspectives.length > 0 ? (
            existingPerspectives.map((content, index) => (
              <article 
                key={content.id} 
                className="article-card"
                onClick={() => window.location.href = `/perspective/${content.id}`}
              >
                <div className="article-image">
                  <i className="fas fa-balance-scale"></i>
                </div>
                
                <div className="article-content">
                  <div className="article-author">
                    <div className="author-avatar">AI</div>
                    <span>In Perspective Analysis by AI Analysis</span>
                  </div>
                  
                  <h2 className="article-title">{content.topic}</h2>
                  
                  {content.summary && (
                    <p className="article-summary">
                      {content.summary.length > 150 
                        ? content.summary.substring(0, 150) + '...'
                        : content.summary
                      }
                    </p>
                  )}
                  
                  {/* Perspective Indicators */}
                  <div className="perspective-indicators">
                    <div className="perspective-indicator for-indicator">
                      <i className="fas fa-thumbs-up"></i>
                      <span>For</span>
                    </div>
                    <div className="perspective-indicator against-indicator">
                      <i className="fas fa-thumbs-down"></i>
                      <span>Against</span>
                    </div>
                  </div>
                  
                  <div className="article-meta">
                    <div className="article-date">
                      <i className="fas fa-star"></i>
                      {formatDate(content.created_at)}
                    </div>
                    
                    <div className="article-stats">
                      <div className="stat-item">
                        <i className="fas fa-eye"></i>
                        <span>{35 + index}</span>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-comment"></i>
                        <span>{1 + index}</span>
                      </div>
                      <button className="bookmark-btn" onClick={toggleBookmark}>
                        <i className="fas fa-bookmark"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <i className="fas fa-balance-scale"></i>
              <h3>No analyses yet</h3>
              <p>Start by entering a topic above to generate your first perspective analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perspective;
