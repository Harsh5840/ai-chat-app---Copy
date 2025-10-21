import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email (from regular signup)
        user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value }
        });

        if (user) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              name: profile.displayName || user.name,
            }
          });
          return done(null, user);
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            username: profile.emails[0].value.split('@')[0], // Use email prefix as username
            name: profile.displayName,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || null,
            password: null, // No password for OAuth users
          }
        });

        done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

export default passport;
