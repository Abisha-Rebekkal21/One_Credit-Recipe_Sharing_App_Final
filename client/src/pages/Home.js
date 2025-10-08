import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { user, login } = useAuth();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [featuredResponse, topRatedResponse] = await Promise.all([
        axios.get('/api/recipes/featured'),
        axios.get('/api/recipes?limit=6&sort=-averageRating')
      ]);
      
      setFeaturedRecipes(featuredResponse.data);
      setTopRated(topRatedResponse.data.recipes);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading delicious recipes..." />;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Share Your Culinary Creations</h1>
          <p className="hero-subtitle">Discover amazing recipes from home cooks around the world</p>
          <div className="hero-actions">
            <Link to="/recipes" className="cta-button primary">Explore Recipes</Link>
            {user && (
              <Link to="/share" className="cta-button secondary">Share Your Recipe</Link>
            )}
          </div>
          {!user && (
            <p className="hero-login">
              <button onClick={login} className="login-link">
                Login with Google
              </button> to share your own recipes!
            </p>
          )}
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <h2 className="section-title">Featured Recipes</h2>
            <p className="section-subtitle">Hand-picked recipes from our community</p>
            <div className="recipes-grid">
              {featuredRecipes.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Recipes */}
      <section className="section top-rated-section">
        <div className="container">
          <h2 className="section-title">Top Rated Recipes</h2>
          <p className="section-subtitle">Most loved by our community</p>
          {topRated.length > 0 ? (
            <div className="recipes-grid">
              {topRated.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No recipes yet</h3>
              <p>Be the first to share a recipe with our community!</p>
              {user ? (
                <Link to="/share" className="cta-button primary">Share Your First Recipe</Link>
              ) : (
                <button onClick={login} className="cta-button primary">
                  Login to Share Recipes
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title">Why Join RecipeShare?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🍳</div>
              <h3>Share Recipes</h3>
              <p>Share your favorite recipes with food lovers from around the world</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Rate & Review</h3>
              <p>Discover amazing recipes and share your feedback with the community</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Discovery</h3>
              <p>Find recipes by category, cooking time, ratings, and more</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Build Reputation</h3>
              <p>Gain recognition as your recipes get loved by the community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Share Your Recipes?</h2>
            <p>Join our community of food enthusiasts and start sharing your culinary creations today!</p>
            <div className="cta-actions">
              {user ? (
                <Link to="/share" className="cta-button large">Share a Recipe</Link>
              ) : (
                <button onClick={login} className="cta-button large">
                  Get Started - It's Free!
                </button>
              )}
              <Link to="/recipes" className="cta-button secondary large">
                Browse Recipes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;