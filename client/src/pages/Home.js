import React from 'react';
import { useAuth } from '../context/AuthContext';


const Home = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Create your Culinary Creations</h1>
          <p className="subtitle">
            Discover amazing recipes from home cooks around the world
          </p>
          <div className="tagline">
            <strong>Culinary Companion</strong>
          </div>
          
          {!user ? (
            <button onClick={login} className="login-button">
              Login with Google
            </button>
          ) : (
            <div className="welcome-section">
              <h2>Welcome, {user.name}!</h2>
              <p>Ready to explore recipes?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;