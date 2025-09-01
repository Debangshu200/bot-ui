// CORS proxy options to bypass CORS issues during local development.
// Try different proxies if one doesn't work
export const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
// Alternative proxies if the above doesn't work:
// export const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url=';
// export const CORS_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';

// Botpress configuration
// IMPORTANT: Replace these values with the ones from your local Botpress server output.
// Run 'bp dev' and copy the bot ID and tunnel URL from the output
export const BOTPRESS_BOT_ID = 'b656baaa-812f-47a3-8d04-4e57f8f6008c';
export const BOTPRESS_WEBHOOK_URL = 'http://localhost:5173';

// For local development, you might need to use a different approach
// Option 1: Use the local Botpress server directly (if running on same machine)
// export const BOTPRESS_WEBHOOK_URL = 'http://localhost:8075';

// Option 2: Use a CORS proxy (uncomment one of these if needed)
// export const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url=';
// export const CORS_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';