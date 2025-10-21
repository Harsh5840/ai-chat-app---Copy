import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const authRouter = express.Router();

// GET /auth/google - Initiate Google OAuth
authRouter.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// GET /auth/google/callback - Google OAuth callback
authRouter.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
    session: false // We'll use JWT instead of sessions
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: req.user.id,
          email: req.user.email 
        },
        process.env.JSON_WEB_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?token=${token}&userId=${req.user.id}&username=${encodeURIComponent(req.user.username)}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=token_generation_failed`);
    }
  }
);

// GET /auth/status - Check authentication status
authRouter.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

export { authRouter };
