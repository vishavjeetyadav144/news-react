// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to get CSRF token
const getCSRFToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get JWT token from localStorage
  const accessToken = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
    },
    credentials: 'include', // Include cookies for CSRF
  };

  // Add Authorization header if token exists
  if (accessToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // For FormData, don't set Content-Type (let browser set it)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && localStorage.getItem('refresh_token')) {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh: refreshToken
            }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('access_token', refreshData.access);
            
            // Retry the original request with new token
            config.headers['Authorization'] = `Bearer ${refreshData.access}`;
            const retryResponse = await fetch(url, config);
            
            if (retryResponse.ok) {
              const retryContentType = retryResponse.headers.get('content-type');
              if (retryContentType && retryContentType.includes('application/json')) {
                return await retryResponse.json();
              } else {
                return await retryResponse.text();
              }
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// News API endpoints
export const newsAPI = {
  // Get all news articles with filtering and pagination
  getNews: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/news/${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get single news article
  getNewsDetail: async (articleId) => {
    return apiRequest(`/news/${articleId}/`);
  },

  // Toggle read status
  toggleReadStatus: async (articleId) => {
    return apiRequest(`/news/${articleId}/toggle-read/`, {
      method: 'POST',
    });
  },

  // Toggle important status
  toggleImportantStatus: async (articleId) => {
    return apiRequest(`/news/${articleId}/toggle-important/`, {
      method: 'POST',
    });
  },

  // Update article tags
  updateTags: async (articleId, tags) => {
    const formData = new FormData();
    formData.append('tags', tags);
    
    return apiRequest(`/news/${articleId}/update-tags/`, {
      method: 'POST',
      body: formData,
    });
  },

  // Delete article
  deleteArticle: async (articleId) => {
    return apiRequest(`/news/${articleId}/delete/`, {
      method: 'POST',
    });
  },

  // Bulk delete articles
  bulkDeleteArticles: async (articleIds) => {
    const formData = new FormData();
    articleIds.forEach(id => formData.append('article_ids', id));
    
    return apiRequest('/news/bulk-delete/', {
      method: 'POST',
      body: formData,
    });
  },

  // Get related articles
  getRelatedArticles: async (articleId) => {
    return apiRequest(`/news/${articleId}/related/`);
  },

  // Get all tags
  getAllTags: async () => {
    return apiRequest('/api/tags/');
  },
};

// Upload API endpoints
export const uploadAPI = {
  // Upload PDF file
  uploadPDF: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/upload/process/', {
      method: 'POST',
      body: formData,
    });
  },

  // Get processing status
  getProcessingStatus: async () => {
    return apiRequest('/processing-status/');
  },
};

// Context API endpoints
export const contextAPI = {
  // Get all context content
  getContexts: async () => {
    return apiRequest('/context/');
  },

  // Generate new context
  generateContext: async (topic) => {
    return apiRequest('/context/', {
      method: 'POST',
      body: JSON.stringify({
        topic: topic
      }),
    });
  },

  // Get context detail
  getContextDetail: async (contentId) => {
    return apiRequest(`/ai-content/${contentId}/?type=context`);
  },
};

// Perspective API endpoints
export const perspectiveAPI = {
  // Get all perspective content
  getPerspectives: async () => {
    return apiRequest('/perspective/');
  },

  // Generate new perspective
  generatePerspective: async (topic) => {
    return apiRequest('/perspective/', {
      method: 'POST',
      body: JSON.stringify({
        topic: topic
      }),
    });
  },

  // Get perspective detail
  getPerspectiveDetail: async (contentId) => {
    return apiRequest(`/ai-content/${contentId}/?type=perspective`);
  },
};

// Home API endpoints
export const homeAPI = {
  // Get home page data
  getHomeData: async () => {
    return apiRequest('/');
  },
};

// Generic API function for custom requests
export const customAPI = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data), ...options }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data), ...options }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { method: 'DELETE', ...options }),
};

export default {
  newsAPI,
  uploadAPI,
  contextAPI,
  perspectiveAPI,
  homeAPI,
  customAPI,
};
