// Get the API base URL from environment variable or use /api as fallback
export const getApiUrl = () => {
  // In production (Render), use the full backend URL from env variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development, use /api (proxied by Vite)
  return '/api';
};

export const API_BASE_URL = getApiUrl();
