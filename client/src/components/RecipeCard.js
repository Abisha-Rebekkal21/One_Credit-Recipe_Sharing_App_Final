import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-card">
      <div className="card-image">
        <img 
          src={recipe.image || '/default-recipe.jpg'} 
          alt={recipe.title}
          onError={(e) => {
            e.target.src = '/default-recipe.jpg';
          }}
        />
      </div>
      <div className="card-content">
        <h3 className="card-title">{recipe.title}</h3>
        <p className="card-description">
          {recipe.description ? recipe.description.substring(0, 100) + '...' : 'No description available'}
        </p>
        <div className="card-meta">
          <span className={`category-tag category-${recipe.category}`}>
            {recipe.category}
          </span>
          <span className="cooking-time">🕒 {recipe.cookingTime} min</span>
        </div>
        <div className="card-rating">
          <span className="stars">⭐ {recipe.averageRating?.toFixed(1) || 'No ratings'}</span>
          <span className="review-count">({recipe.reviewCount || 0})</span>
        </div>
        <div className="card-author">
          <img src={recipe.author?.avatar || '/default-avatar.jpg'} alt={recipe.author?.name} className="author-avatar" />
          <span>By {recipe.author?.name || 'Unknown'}</span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;