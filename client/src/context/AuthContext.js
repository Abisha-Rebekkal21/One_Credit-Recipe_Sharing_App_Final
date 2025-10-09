import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Use environment variable or fallback to your deployed backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://recipe-sharing-server-9vja.onrender.com';

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
      console.log('🔍 Checking authentication status...');
      console.log('🌐 Making request to:', `${API_BASE_URL}/auth/user`);
      
      const response = await axios.get(`${API_BASE_URL}/auth/user`, { 
        withCredentials: true
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
      
      setUser(null);
      setError(error.response?.data?.message || 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    console.log('🚀 Redirecting to Google OAuth...');
    setError(null);
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await axios.get(`${API_BASE_URL}/auth/logout`, { withCredentials: true });
      setUser(null);
      setError(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
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