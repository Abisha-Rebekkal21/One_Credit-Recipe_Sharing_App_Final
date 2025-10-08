import express from 'express';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// Admin dashboard stats
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    
    const topRatedRecipes = await Recipe.find()
      .populate('author', 'name')
      .sort('-averageRating')
      .limit(10);

    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(10);

    const recipesByCategory = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]);

    res.json({
      totalUsers,
      totalRecipes,
      topRatedRecipes,
      recentUsers,
      recipesByCategory
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error while fetching admin stats' });
  }
});

// Feature a recipe
router.put('/recipes/:id/feature', auth, admin, async (req, res) => {
  try {
    const { featured, duration } = req.body; // duration in days
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.featured = featured;
    if (featured && duration) {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + duration);
      recipe.featuredUntil = featuredUntil;
    } else {
      recipe.featuredUntil = null;
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    console.error('Error featuring recipe:', error);
    res.status(400).json({ message: 'Error featuring recipe: ' + error.message });
  }
});

export default router;