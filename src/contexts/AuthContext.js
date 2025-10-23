import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token')
  });

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const decodedToken = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            // Token is valid, fetch user data
            fetchUserProfile();
          } else {
            // Token expired, try to refresh
            refreshToken();
          }
        } catch (error) {
          console.error('Invalid token:', error);
          logout();
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const result = await authAPI.getUserProfile();
      if (result.success) {
        setUser(result.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      logout();
      return;
    }

    try {
      const result = await authAPI.refreshToken(refreshTokenValue);
      if (result.success) {
        localStorage.setItem('access_token', result.data.access);
        setTokens(prev => ({ ...prev, access: result.data.access }));
        fetchUserProfile();
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    if (result.success) {
      localStorage.setItem('access_token', result.data.tokens.access);
      localStorage.setItem('refresh_token', result.data.tokens.refresh);
      setTokens(result.data.tokens);
      setUser(result.data.user);
    }
    return result;
  };

  const register = async (userData) => {
    const result = await authAPI.register(userData);
    if (result.success) {
      localStorage.setItem('access_token', result.data.tokens.access);
      localStorage.setItem('refresh_token', result.data.tokens.refresh);
      setTokens(result.data.tokens);
      setUser(result.data.user);
    }
    return result;
  };

  const googleAuth = async (accessToken) => {
    const result = await authAPI.googleAuth(accessToken);
    if (result.success) {
      localStorage.setItem('access_token', result.data.tokens.access);
      localStorage.setItem('refresh_token', result.data.tokens.refresh);
      setTokens(result.data.tokens);
      setUser(result.data.user);
    }
    return result;
  };

  const logout = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (refreshTokenValue) {
        await authAPI.logout(refreshTokenValue);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setTokens({ access: null, refresh: null });
      setUser(null);
    }
  };

  const value = {
    user,
    tokens,
    loading,
    login,
    register,
    googleAuth,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
