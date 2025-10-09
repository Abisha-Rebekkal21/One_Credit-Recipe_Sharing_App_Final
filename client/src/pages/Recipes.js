import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    sort: '-averageRating',
    search: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'all', 'breakfast', 'lunch', 'dinner', 'dessert', 'juice', 'smoothie', 'snack', 'beverage'
  ];

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/recipes', { params: filters });
      
      // Add safety checks for the response data
      const recipesData = response.data?.recipes || [];
      const pages = response.data?.totalPages || 1;
      
      setRecipes(recipesData);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Error loading recipes. Please try again.');
      // Reset to empty array on error
      setRecipes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  return (
    <div className="recipes-page">
      <div className="container">
        <div className="page-header">
          <h1>Discover Recipes</h1>
          <p>Find your next favorite meal from our community</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search recipes by title or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>

          <div className="filter-controls">
            <select 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select 
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="filter-select"
            >
              <option value="-averageRating">Highest Rated</option>
              <option value="-createdAt">Newest First</option>
              <option value="cookingTime">Quickest First</option>
              <option value="title">A to Z</option>
            </select>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <LoadingSpinner message="Loading recipes..." />
        ) : (
          <>
            <div className="recipes-grid">
              {/* Add safety check for recipes array */}
              {recipes && recipes.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {(!recipes || recipes.length === 0) && !loading && (
              <div className="empty-state">
                <h3>No recipes found</h3>
                <p>Try adjusting your filters or be the first to share a recipe!</p>
                <Link to="/share" className="cta-button primary">Share Recipe</Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setFilters(prev => ({ ...prev, page }))}
                      className={`pagination-btn ${filters.page === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipes;