import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, login, logout, loading } = useAuth();
  const location = useLocation();

  // Show loading state or minimal navbar during auth check
  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🍳 RecipeShare
          </Link>
          <div className="nav-loading">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🍳 RecipeShare
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/recipes" 
            className={`nav-link ${location.pathname === '/recipes' ? 'active' : ''}`}
          >
            Recipes
          </Link>
          {user && (
            <Link 
              to="/share" 
              className={`nav-link ${location.pathname === '/share' ? 'active' : ''}`}
            >
              Share Recipe
            </Link>
          )}
          {user?.isAdmin && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name} 
                className="user-avatar"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span className="user-name">{user.name || 'User'}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={login} className="login-btn">
              <span className="google-icon">🔐</span>
              Login with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;