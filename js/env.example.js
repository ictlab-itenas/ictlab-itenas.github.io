// Example environment configuration for static hosting
// IMPORTANT: For GitHub Pages (static), there is no server-side .env.
// Use env.js (not committed) to override these values in production.

window.__ENV__ = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'public-anon-key-here',
  GOOGLE_CLIENT_ID: 'your-google-oauth-client-id.apps.googleusercontent.com'
};
