// Utility functions to parse JSON API responses from Django backend

// Parse home page JSON response
export const parseHomePageData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      news_articles: [],
      total_articles: 0
    };
  }

  return {
    news_articles: jsonResponse.news_articles || [],
    total_articles: jsonResponse.total_articles || 0
  };
};

// Parse news list JSON response
export const parseNewsListData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      news_articles: [],
      total_articles: 0,
      pagination: {
        current_page: 1,
        total_pages: 1,
        has_next: false,
        has_previous: false,
        per_page: 12
      },
      filters: {
        all_topics: [],
        applied_filters: {}
      }
    };
  }

  // Ensure each article has custom_tags field
  const articles = (jsonResponse.articles || []).map(article => ({
    ...article,
    custom_tags: Array.isArray(article.custom_tags) ? article.custom_tags : []
  }));

  return {
    news_articles: articles,
    total_articles: jsonResponse.pagination?.total_articles || 0,
    pagination: {
      current_page: jsonResponse.pagination?.current_page || 1,
      total_pages: jsonResponse.pagination?.total_pages || 1,
      has_next: jsonResponse.pagination?.has_next || false,
      has_previous: jsonResponse.pagination?.has_previous || false,
      per_page: jsonResponse.pagination?.per_page || 12
    },
    filters: {
      all_topics: jsonResponse.filters?.all_topics || [],
      applied_filters: jsonResponse.filters?.applied_filters || {}
    }
  };
};

// Parse single article JSON response
export const parseNewsDetailData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      article: null,
      navigation: {
        previous: null,
        next: null,
        current_position: 1,
        total_articles: 1
      }
    };
  }

  const article = jsonResponse.article;
  
  return {
    article: {
      id: article.id,
      headline: article.headline || '',
      news: article.news || '',
      details: article.details || '',
      prelims_point: article.prelims_point || '',
      tags: Array.isArray(article.tags) ? article.tags : [],
      topics: Array.isArray(article.topics) ? article.topics : [],
      last_updated: article.last_updated || new Date().toISOString(),
      is_read: article.is_read || false,
      is_important: article.is_important || false,
      custom_tags: Array.isArray(article.custom_tags) ? article.custom_tags : []
    },
    navigation: {
      previous: article.navigation?.previous || null,
      next: article.navigation?.next || null,
      current_position: article.navigation?.current_position || 1,
      total_articles: article.navigation?.total_articles || 1
    }
  };
};

// Parse context data JSON response
export const parseContextData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      contexts: []
    };
  }

  const contexts = (jsonResponse.contexts || []).map(context => ({
    id: context.id,
    topic: context.topic || '',
    image_url: context.image_url || {},
    content: context.content || {},
    tags: Array.isArray(context.tags) ? context.tags : [],
    upsc_relevance: context.upsc_relevance || '',
    created_at: context.created_at ? new Date(context.created_at) : new Date()
  }));

  return {
    contexts: contexts
  };
};

// Parse perspective data JSON response
export const parsePerspectiveData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      perspectives: []
    };
  }

  const perspectives = (jsonResponse.perspectives || []).map(perspective => ({
    id: perspective.id,
    topic: perspective.topic || '',
    content: perspective.content || {},
    summary: perspective.summary || '',
    tags: Array.isArray(perspective.tags) ? perspective.tags : [],
    upsc_relevance: perspective.upsc_relevance || '',
    created_at: perspective.created_at ? new Date(perspective.created_at) : new Date()
  }));

  return {
    perspectives: perspectives
  };
};

// Parse upload page data JSON response
export const parseUploadPageData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      recent_uploads: []
    };
  }

  const uploads = (jsonResponse.recent_uploads || []).map(upload => ({
    id: upload.id,
    title: upload.title || '',
    filename: upload.filename || '',
    uploaded_at: upload.uploaded_at ? new Date(upload.uploaded_at) : new Date(),
    processed: upload.processed || false,
    task_status: upload.task_status || 'PENDING',
    total_pages: upload.total_pages || 0,
    processed_pages: upload.processed_pages || 0,
    error_message: upload.error_message || null,
    processing_started_at: upload.processing_started_at ? new Date(upload.processing_started_at) : null,
    processing_completed_at: upload.processing_completed_at ? new Date(upload.processing_completed_at) : null
  }));

  return {
    recent_uploads: uploads
  };
};

// Parse upload status from processing status API
export const parseUploadStatus = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.uploads) {
    return [];
  }

  return jsonResponse.uploads.map(upload => ({
    id: upload.id,
    fileName: upload.filename || '',
    totalPages: upload.total_pages || 0,
    processedPages: upload.processed_pages || 0,
    processed: upload.processed || false,
    progress: upload.progress || 0,
    taskStatus: upload.task_status || 'PENDING',
    taskId: upload.task_id || null,
    errorMessage: upload.error_message || null,
    processingStartedAt: upload.processing_started_at ? new Date(upload.processing_started_at) : null,
    processingCompletedAt: upload.processing_completed_at ? new Date(upload.processing_completed_at) : null
  }));
};

// Parse tags JSON response
export const parseTagsData = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.tags) {
    return [];
  }

  return jsonResponse.tags;
};

// Parse related articles JSON response
export const parseRelatedArticles = (jsonResponse) => {
  if (!jsonResponse || !jsonResponse.success) {
    return {
      related_articles: [],
      count: 0
    };
  }

  return {
    related_articles: jsonResponse.related_articles || [],
    count: jsonResponse.count || 0
  };
};

// Parse API response for toggle operations (read status, important status)
export const parseToggleResponse = (jsonResponse) => {
  if (!jsonResponse) {
    return {
      success: false,
      message: 'No response received'
    };
  }

  return {
    success: jsonResponse.success || false,
    message: jsonResponse.message || '',
    is_read: jsonResponse.is_read,
    is_important: jsonResponse.is_important
  };
};

// Parse API response for tag updates
export const parseTagUpdateResponse = (jsonResponse) => {
  if (!jsonResponse) {
    return {
      success: false,
      message: 'No response received',
      tags: []
    };
  }

  return {
    success: jsonResponse.success || false,
    message: jsonResponse.message || '',
    tags: jsonResponse.tags || []
  };
};

// Parse API response for PDF upload
export const parseUploadResponse = (jsonResponse) => {
  if (!jsonResponse) {
    return {
      success: false,
      message: 'No response received'
    };
  }

  return {
    success: jsonResponse.success || false,
    message: jsonResponse.message || '',
    upload_id: jsonResponse.upload_id || null,
    task_id: jsonResponse.task_id || null,
    duplicate: jsonResponse.duplicate || false
  };
};

// Parse API response for context/perspective generation
export const parseGenerationResponse = (jsonResponse) => {
  if (!jsonResponse) {
    return {
      success: false,
      message: 'No response received'
    };
  }

  return {
    success: jsonResponse.success || false,
    message: jsonResponse.message || '',
    context: jsonResponse.context || null,
    perspective: jsonResponse.perspective || null
  };
};

// Generic error handler for API responses
export const parseErrorResponse = (error) => {
  if (error.response && error.response.data) {
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      status: error.response.status || 500
    };
  }

  return {
    success: false,
    message: error.message || 'Network error occurred',
    status: 0
  };
};

// Format date for display
export const formatDate = (dateString) => {
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

// Format tags array to string
export const formatTags = (tags) => {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
};

// Format topics array to string
export const formatTopics = (topics) => {
  if (!Array.isArray(topics)) return '';
  return topics.join(', ');
};

// Parse and format article for display
export const formatArticleForDisplay = (article) => {
  if (!article) return null;

  return {
    ...article,
    formatted_date: formatDate(article.last_updated),
    formatted_tags: formatTags(article.tags),
    formatted_topics: formatTopics(article.topics),
    excerpt: article.details ? article.details.substring(0, 200) + '...' : '',
    news_excerpt: article.news ? article.news.substring(0, 150) + '...' : ''
  };
};

export default {
  parseHomePageData,
  parseNewsListData,
  parseNewsDetailData,
  parseContextData,
  parsePerspectiveData,
  parseUploadPageData,
  parseUploadStatus,
  parseTagsData,
  parseRelatedArticles,
  parseToggleResponse,
  parseTagUpdateResponse,
  parseUploadResponse,
  parseGenerationResponse,
  parseErrorResponse,
  formatDate,
  formatTags,
  formatTopics,
  formatArticleForDisplay
};
