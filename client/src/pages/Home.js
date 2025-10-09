import React from 'react';
import { useAuth } from '../context/AuthContext';


const Home = () => {
  const { user, login } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Create your <span className="highlight">Culinary Creations</span>
          </h1>
          <p className="hero-subtitle">
            Discover amazing recipes from home cooks around the world
          </p>
          <p className="hero-tagline">
            <strong>Culinary Companion</strong>
          </p>
          
          {!user && (
            <button onClick={login} className="cta-button">
              <span className="google-icon">🔐</span>
              Login with Google
            </button>
          )}
          
          {user && (
            <div className="welcome-message">
              <h2>Welcome back, {user.name}! 👨‍🍳</h2>
              <p>Ready to share your next culinary masterpiece?</p>
            </div>
          )}
        </div>
        
        <div className="hero-image">
          <div className="food-illustration">
            <span className="emoji">🍳</span>
            <span className="emoji">🥘</span>
            <span className="emoji">🍲</span>
            <span className="emoji">🥗</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why RecipeShare?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Share Your Recipes</h3>
              <p>Upload your favorite recipes and cooking tips with the community</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Discover New Dishes</h3>
              <p>Find inspiration from thousands of recipes shared by home cooks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Rate & Review</h3>
              <p>Share your experience and help others find the best recipes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Recipes Preview */}
      <section className="recipes-preview">
        <div className="container">
          <h2 className="section-title">Featured Recipes</h2>
          <div className="recipes-grid">
            <div className="recipe-card placeholder">
              <div className="recipe-image">📷</div>
              <h3>Sign in to view recipes</h3>
              <p>Login to explore our collection of amazing dishes</p>
            </div>
            <div className="recipe-card placeholder">
              <div className="recipe-image">📷</div>
              <h3>Share your own</h3>
              <p>Join the community and contribute your recipes</p>
            </div>
            <div className="recipe-card placeholder">
              <div className="recipe-image">📷</div>
              <h3>Get inspired</h3>
              <p>Discover new flavors and cooking techniques</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;