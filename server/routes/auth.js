import express from 'express';
import passport from 'passport';

const router = express.Router();

// Debug session middleware
const debugSession = (req, res, next) => {
  console.log('🔍 Session Debug:');
  console.log('   Session ID:', req.sessionID);
  console.log('   User in session:', req.user);
  console.log('   Session keys:', Object.keys(req.session));
  next();
};

// Test route to check session
router.get('/test-session', debugSession, (req, res) => {
  res.json({
    sessionId: req.sessionID,
    user: req.user,
    sessionExists: !!req.session,
    cookies: req.headers.cookie
  });
});

// Get current user with session debug
router.get('/user', debugSession, (req, res) => {
  console.log('👤 Auth check - Headers:', {
    cookie: req.headers.cookie,
    origin: req.headers.origin
  });
  
  if (req.user) {
    console.log('✅ User is authenticated:', req.user.email);
    res.json(req.user);
  } else {
    console.log('❌ No user in session');
    res.status(401).json({ 
      message: 'Not authenticated',
      sessionId: req.sessionID,
      hasSession: !!req.session
    });
  }
});

// Google OAuth routes
router.get('/google',
  debugSession,
  (req, res, next) => {
    console.log('🔐 Starting Google OAuth...');
    console.log('📱 From origin:', req.headers.origin);
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  debugSession,
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/?oauth_failed=true`,
    failureMessage: true 
  }),
  (req, res) => {
    console.log('✅ OAuth successful! User:', req.user.email);
    console.log('🔄 Redirecting to:', process.env.CLIENT_URL);
    
    // Successful authentication
    res.redirect(`${process.env.CLIENT_URL}/?oauth_success=true&user=${encodeURIComponent(req.user.name)}`);
  }
);

// Logout
router.get('/logout', debugSession, (req, res) => {
  console.log('🚪 Logging out user:', req.user?.email);
  
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.json({ 
        message: 'Logged out successfully',
        sessionDestroyed: true
      });
    });
  });
});

export default router;