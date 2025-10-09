import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Use environment variable or fallback to your deployed backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://recipe-sharing-server-9vja.onrender.com';

const ShareRecipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    category: 'breakfast',
    cookingTime: 30,
    difficulty: 'medium',
    image: ''
  });

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to share your recipes.</p>
          <button onClick={() => navigate('/')} className="cta-button primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('📝 Submitting recipe data:', formData);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/recipes`);
      
      // Filter out empty ingredients and instructions
      const submitData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.trim() !== '')
      };

      const response = await axios.post(`${API_BASE_URL}/api/recipes`, submitData, {
        withCredentials: true
      });
      
      console.log('✅ Recipe created successfully:', response.data);
      alert('Recipe shared successfully!');
      navigate('/recipes');
    } catch (error) {
      console.error('❌ Error creating recipe:', error);
      console.log('📊 Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
      if (error.response?.status === 401) {
        alert('Please log in to share recipes.');
        navigate('/');
      } else if (error.response?.status === 400) {
        alert('Invalid recipe data. Please check all fields and try again.');
      } else {
        alert('Error creating recipe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-recipe-page">
      <div className="container">
        <div className="page-header">
          <h1>Share Your Recipe</h1>
          <p>Inspire others with your culinary creations</p>
        </div>

        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Recipe Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Fluffy Pancakes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe your recipe, what makes it special?"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="dessert">Dessert</option>
                  <option value="juice">Juice</option>
                  <option value="smoothie">Smoothie</option>
                  <option value="snack">Snack</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cookingTime">Cooking Time (minutes) *</label>
                <input
                  type="number"
                  id="cookingTime"
                  name="cookingTime"
                  value={formData.cookingTime}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty *</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL (optional)</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/recipe-image.jpg"
              />
              <small>Leave empty for default recipe image</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Ingredients</h3>
            <p className="form-help">List all ingredients with quantities (e.g., "2 cups flour", "1 tsp salt")</p>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="array-field-group">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  placeholder={`Ingredient ${index + 1} (e.g., 1 cup flour)`}
                  required
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('ingredients', index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('ingredients')}
              className="add-btn"
            >
              + Add Ingredient
            </button>
          </div>

          <div className="form-section">
            <h3>Instructions</h3>
            <p className="form-help">Describe each step in order</p>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="array-field-group">
                <textarea
                  value={instruction}
                  onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                  placeholder={`Step ${index + 1} - Describe what to do in this step`}
                  required
                  rows="3"
                />
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('instructions', index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('instructions')}
              className="add-btn"
            >
              + Add Step
            </button>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn primary"
            >
              {loading ? 'Sharing Recipe...' : 'Share Recipe'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/recipes')}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareRecipe;