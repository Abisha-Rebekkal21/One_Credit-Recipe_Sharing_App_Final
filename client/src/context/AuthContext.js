import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Use the correct URL from your console
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://recipe-sharing-server-9vfa.onrender.com';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

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
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔧 API Base URL:', API_BASE_URL);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking authentication status...');
      console.log('🌐 Making request to:', `${API_BASE_URL}/multi/user`);
      
      const response = await axios.get('/multi/user', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Auth check successful:', response.data);
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      console.log('📊 Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
      // 401 is expected when not authenticated, don't treat as error
      if (error.response?.status !== 401) {
        setError(error.response?.data?.message || 'Authentication check failed');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    console.log('🚀 Redirecting to Google OAuth...');
    setError(null);
    // This should redirect to your backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await axios.get('/auth/logout', { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      // Force full page reload to clear any state
      window.location.href = '/';
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};