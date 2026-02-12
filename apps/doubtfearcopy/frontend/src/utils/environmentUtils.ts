/**
 * Utility functions for handling environment-specific configurations
 */

/**
 * Determines if the application is running in development mode
 * @returns boolean indicating if in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Gets the appropriate base URL for the current environment
 * @returns The base URL for the current environment
 */
export const getBaseUrl = (): string => {
  // Check if running on specific Vercel deployments
  if (window.location.hostname.includes('vercel-frontend2-git-main-aishafaang-gmailcoms-projects.vercel.app')) {
    return 'https://vercel-frontend2-git-main-aishafaang-gmailcoms-projects.vercel.app';
  }
  // Check if running on other Vercel deployments
  else if (window.location.hostname.includes('vercel.app')) {
    return `https://${window.location.hostname}`;
  }
  
  // Development vs Production
  return isDevelopment() ? 'http://localhost:3000' : 'https://toriate.com';
};

/**
 * Gets the appropriate redirect URL for OAuth callbacks
 * @param path The path to redirect to (e.g., '/oauth/callback')
 * @returns The full redirect URL
 */
export const getRedirectUrl = (path: string): string => {
  return `${getBaseUrl()}${path}`;
};

/**
 * Gets the appropriate API URL for the current environment
 * @returns The API URL for the current environment
 */
export const getApiUrl = (): string => {
  return isDevelopment() 
    ? 'http://localhost:5001/api' 
    : 'https://vercel-backend2-qj8e.vercel.app/api';
};