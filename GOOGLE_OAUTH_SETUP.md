# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the AI Chat App.

## Prerequisites

- A Google account
- Google Cloud Console access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "AI Chat App")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: AI Chat App
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click "Save and Continue"
9. Add test users (your email) on the "Test users" page
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "AI Chat App Web Client")
5. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:5000
   ```
6. Under "Authorized redirect URIs", add:
   ```
   http://localhost:5000/api/v1/auth/google/callback
   ```
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 5: Update Environment Variables

1. Open `http/.env` file
2. Replace the placeholder values:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id-from-step-4
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-step-4
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
   SESSION_SECRET=generate-a-random-secret-string-here
   ```

   **Note**: For `SESSION_SECRET`, generate a random string (at least 32 characters). You can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 6: Restart Backend Server

1. Stop the backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd http
   npm start
   ```

## Step 7: Test OAuth Flow

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
2. Navigate to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. Select your Google account
6. Grant permissions
7. You should be redirected back to the app and logged in automatically

## Production Deployment

For production, you'll need to:

1. Update the OAuth consent screen to "In production" status
2. Add your production domain to "Authorized JavaScript origins"
3. Add your production callback URL to "Authorized redirect URIs":
   ```
   https://your-domain.com/api/v1/auth/google/callback
   ```
4. Update the environment variables in your production environment
5. Set `NODE_ENV=production` for secure cookies

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the callback URL in Google Cloud Console exactly matches the one in your `.env` file
- Check that there are no trailing slashes or typos

### "Error: Invalid session secret"
- Ensure `SESSION_SECRET` is set in your `.env` file
- Restart the backend server after changing environment variables

### "User not redirected after login"
- Check browser console for errors
- Verify that the frontend URL in the backend callback matches your frontend port (3000)
- Clear browser cookies and try again

### "OAuth consent screen shows 'unverified app' warning"
- This is normal for apps in testing mode
- Click "Advanced" > "Go to [App Name] (unsafe)" to proceed during development

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret confidential
- Use HTTPS in production
- Regularly rotate your session secret
- Consider implementing CSRF protection for production
