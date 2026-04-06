// Get the API base URL from environment variable or use /api as fallback
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};

export const API_BASE_URL = getApiUrl();
