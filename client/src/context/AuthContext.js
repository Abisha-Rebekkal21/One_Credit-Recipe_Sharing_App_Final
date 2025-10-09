import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Fixed API URL - use the correct one from your console
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://recipe-sharing-server-9vfa.onrender.com';

// Configure axios once
axios.defaults.withCredentials = true;

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
      
      // Use the correct endpoint - /auth/user instead of /multi/user
      const response = await axios.get(`${API_BASE_URL}/auth/user`, {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ Auth check successful:', response.data);
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      
      // Don't show error for 401 (not authenticated) - this is normal
      if (error.response?.status === 401) {
        console.log('ℹ️ User not authenticated (normal for first visit)');
      } else if (error.response?.status === 404) {
        console.error('🚫 Endpoint not found - check server routes');
        setError('Authentication service unavailable');
      } else {
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
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await axios.get(`${API_BASE_URL}/auth/logout`, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      // Redirect to home page
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