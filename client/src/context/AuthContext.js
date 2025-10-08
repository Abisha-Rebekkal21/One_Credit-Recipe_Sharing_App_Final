import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      console.log('🌐 Making request to /auth/user with credentials...');
      
      const response = await axios.get('/auth/user', { 
        withCredentials: true // This is crucial!
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
    // Use window.open to avoid React Router issues
    window.open('http://localhost:5000/auth/google', '_self');
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await axios.get('/auth/logout', { withCredentials: true });
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