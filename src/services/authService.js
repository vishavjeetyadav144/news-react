// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

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
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API endpoints
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: { message: 'Network error' } };
    }
  },

  // User login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: { message: 'Network error' } };
    }
  },

  // Google OAuth authentication
  googleAuth: async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Google auth error:', error);
      return { success: false, error: { message: 'Network error' } };
    }
  },

  // User logout
  logout: async (refreshToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.user };
      } else {
        return { success: false, error: 'Failed to fetch profile' };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Refresh JWT token
  refreshToken: async (refreshToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: 'Token refresh failed' };
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: { message: 'Network error' } };
    }
  },
};

export default authAPI;
