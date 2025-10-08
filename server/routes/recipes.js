import express from 'express';
import Recipe from '../models/Recipe.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all recipes with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { category, sort = '-averageRating', search, page = 1, limit = 12 } = req.query;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error while fetching recipes' });
  }
});

// Get featured recipes
router.get('/featured', async (req, res) => {
  try {
    const featuredRecipes = await Recipe.find({ 
      $or: [
        { featured: true, featuredUntil: { $gte: new Date() } },
        { featured: true, featuredUntil: { $exists: false } }
      ]
    })
      .populate('author', 'name avatar')
      .sort('-averageRating')
      .limit(6);

    res.json(featuredRecipes);
  } catch (error) {
    console.error('Error fetching featured recipes:', error);
    res.status(500).json({ message: 'Server error while fetching featured recipes' });
  }
});

// Get single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('ratings.user', 'name avatar');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Server error while fetching recipe' });
  }
});

// Create new recipe
router.post('/', auth, async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      author: req.user._id
    });

    await recipe.save();
    await recipe.populate('author', 'name avatar');
    
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ message: 'Error creating recipe: ' + error.message });
  }
});

// Rate a recipe
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already rated
    const existingRatingIndex = recipe.ratings.findIndex(r => 
      r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex > -1) {
      recipe.ratings[existingRatingIndex].rating = rating;
    } else {
      recipe.ratings.push({
        user: req.user._id,
        rating
      });
    }

    await recipe.save();
    await recipe.populate('ratings.user', 'name avatar');
    res.json(recipe);
  } catch (error) {
    console.error('Error rating recipe:', error);
    res.status(400).json({ message: 'Error rating recipe: ' + error.message });
  }
});

export default router;