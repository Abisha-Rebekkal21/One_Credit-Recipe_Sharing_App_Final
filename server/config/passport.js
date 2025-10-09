import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // Will use new ID from environment
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Will use new secret from environment
  callbackURL: process.env.NODE_ENV === 'production' 
    ? "https://recipe-sharing-server-9vja.onrender.com/auth/google/callback"
    : "http://localhost:5000/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile received:', profile);
    
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value
    });

    // Make first user admin
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      user.isAdmin = true;
    }

    await user.save();
    console.log('New user created:', user);
    done(null, user);
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});