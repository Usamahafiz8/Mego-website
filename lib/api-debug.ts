/**
 * API Debug Utilities
 * Enable/disable API request/response logging for debugging
 */

import api from './api';

let debugEnabled = false;

export const enableApiDebug = () => {
  if (debugEnabled) return;
  debugEnabled = true;

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Headers:', config.headers);
      if (config.data) {
        console.log('Data:', config.data);
      }
      console.groupEnd();
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      console.group(`✅ API Response: ${response.status} ${response.config.url}`);
      console.log('Data:', response.data);
      console.groupEnd();
      return response;
    },
    (error) => {
      console.group(`❌ API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`);
      console.error('Error:', error.response?.data || error.message);
      console.log('Request:', error.config);
      console.groupEnd();
      return Promise.reject(error);
    }
  );
};

export const disableApiDebug = () => {
  debugEnabled = false;
};

// Auto-enable in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to enable debug logging in development
  // enableApiDebug();
}




