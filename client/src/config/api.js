// API base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative URLs in production (same domain)
  : 'http://localhost:5001/api';  // Use absolute URLs in development

export { API_BASE_URL };
