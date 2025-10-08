import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);
      
      if (user) {
        const existingRating = response.data.ratings.find(
          rating => rating.user._id === user._id
        );
        if (existingRating) {
          setUserRating(existingRating.rating);
        }
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateRecipe = async (rating) => {
    if (!user) {
      alert('Please log in to rate recipes');
      navigate('/');
      return;
    }

    setRatingLoading(true);
    try {
      await axios.post(`/api/recipes/${id}/rate`, { rating });
      setUserRating(rating);
      fetchRecipe(); // Refresh to show updated rating
    } catch (error) {
      console.error('Error rating recipe:', error);
      alert('Error rating recipe. Please try again.');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading recipe..." />;
  }

  if (!recipe) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Recipe Not Found</h2>
          <p>The recipe you're looking for doesn't exist.</p>
          <Link to="/recipes" className="cta-button primary">Browse Recipes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <div className="container">
        {/* Recipe Header */}
        <div className="recipe-header">
          <div className="recipe-image">
            <img 
              src={recipe.image || '/default-recipe.jpg'} 
              alt={recipe.title}
              onError={(e) => {
                e.target.src = '/default-recipe.jpg';
              }}
            />
          </div>
          
          <div className="recipe-info">
            <h1 className="recipe-title">{recipe.title}</h1>
            <p className="recipe-description">{recipe.description}</p>
            
            <div className="recipe-meta">
              <span className={`category-badge category-${recipe.category}`}>
                {recipe.category}
              </span>
              <span className="meta-item">🕒 {recipe.cookingTime} min</span>
              <span className="meta-item">📊 {recipe.difficulty}</span>
              <div className="rating-overview">
                <span className="rating-stars">⭐ {recipe.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="rating-count">({recipe.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="author-section">
              <img src={recipe.author.avatar} alt={recipe.author.name} className="author-avatar" />
              <div className="author-info">
                <span className="author-name">By {recipe.author.name}</span>
                <span className="recipe-date">
                  Posted on {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Rating Widget */}
            {user && (
              <div className="rating-widget">
                <h3>Rate this recipe:</h3>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRateRecipe(star)}
                      disabled={ratingLoading}
                      className={`star-btn ${star <= userRating ? 'active' : ''} ${ratingLoading ? 'disabled' : ''}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <span className="current-rating">
                  Your rating: {userRating > 0 ? `${userRating} stars` : 'Not rated'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Content */}
        <div className="recipe-content">
          <div className="ingredients-section">
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="instructions-section">
            <h2>Instructions</h2>
            <ol className="instructions-list">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="instruction-step">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="recipe-actions">
          <Link to="/recipes" className="cta-button secondary">
            ← Back to Recipes
          </Link>
          {user && user._id === recipe.author._id && (
            <button className="cta-button primary">
              Edit Recipe (Coming Soon)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;