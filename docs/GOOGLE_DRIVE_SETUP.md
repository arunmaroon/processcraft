# Google OAuth 2.0 Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted
4. Choose "Web application" as the application type
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain
7. Copy the Client ID

## 3. Create API Key

1. In "Credentials", click "Create Credentials" > "API key"
2. Copy the API key
3. (Optional) Restrict the API key to Google Drive API

## 4. Environment Variables

Create a `.env` file in your frontend directory with:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here
```

## 5. OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: "ProcessCraft AI Training Data"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.file`
5. Add test users (for development)

## 6. Security Notes

- Keep your Client ID and API Key secure
- Use environment variables, never commit them to version control
- Consider using OAuth 2.0 PKCE for enhanced security in production
- Regularly rotate your API keys

## 7. Testing

1. Start your development server: `npm start`
2. Navigate to the AI Chat tab
3. Click "Sign In with Gmail"
4. Authorize the application
5. Your Google Drive files should appear for import
