import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      alert('Error loading admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your recipe sharing community</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🍳</div>
            <div className="stat-content">
              <h3>Total Recipes</h3>
              <p className="stat-number">{stats.totalRecipes}</p>
            </div>
          </div>
        </div>

        <div className="admin-sections">
          {/* Top Rated Recipes */}
          <section className="admin-section">
            <h2>Top Rated Recipes</h2>
            <div className="recipes-list">
              {stats.topRatedRecipes.map(recipe => (
                <div key={recipe._id} className="admin-recipe-item">
                  <div className="recipe-info">
                    <h4>{recipe.title}</h4>
                    <p>By {recipe.author.name}</p>
                  </div>
                  <div className="recipe-stats">
                    <span className="rating">⭐ {recipe.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="reviews">({recipe.reviewCount} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recipes by Category */}
          <section className="admin-section">
            <h2>Recipes by Category</h2>
            <div className="category-stats">
              {stats.recipesByCategory.map(cat => (
                <div key={cat._id} className="category-item">
                  <span className="category-name">{cat._id}</span>
                  <span className="category-count">{cat.count} recipes</span>
                  <span className="category-rating">Avg: {cat.avgRating?.toFixed(1) || '0.0'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Users */}
          <section className="admin-section">
            <h2>Recent Users</h2>
            <div className="users-list">
              {stats.recentUsers.map(user => (
                <div key={user._id} className="user-item">
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <p className="join-date">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;