import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; //|| 'http://3.91.9.196'
const API_VERSION = 'v1';
const FULL_API_URL = `${API_BASE_URL}/${API_VERSION}`;

// Log API URL in development
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 Full API URL:', FULL_API_URL);
}

// Create axios instance with performance optimizations
const api = axios.create({
  baseURL: FULL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          fullURL: (config.baseURL || '') + (config.url || ''),
          data: config.data,
        });
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        url: response.config?.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging for debugging - always log errors
    console.error('❌ API Error:', {
      url: error.config?.url,
      fullURL: (error.config?.baseURL || '') + (error.config?.url || ''),
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      requestData: error.config?.data,
    });

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper to get image URL
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder-image.jpg';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

// Auth APIs
export const authApi = {
  signup: (data: { name: string; phone: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
  googleAuth: (data: { accessToken: string }) =>
    api.post('/auth/google', data),
  facebookAuth: (data: { accessToken: string }) =>
    api.post('/auth/facebook', data),
  // sendEmailOtp: (data: { email: string }) =>
  //   api.post('/auth/send-email-otp', data),
  // verifyEmailOtp: (data: { email: string; code: string }) =>
  //   api.post('/auth/verify-email-otp', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: FormData) =>
    api.put('/auth/update-profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateSettings: (data: { darkMode: boolean; notificationsEnabled: boolean }) =>
    api.put('/auth/update-settings', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  updatePrivacy: (data: { hideProfile: boolean; allowMessages: boolean }) =>
    api.put('/auth/update-privacy', data),
  updateLanguage: (data: { language: string }) =>
    api.put('/auth/update-language', data),
};

// Ads APIs
export const adsApi = {
  getAll: () => api.get('/ads'),
  getById: (id: number) => api.get(`/ads/${id}`),
  getMyAds: () => api.get('/ads/my'),
  create: (data: FormData) =>
    api.post('/ads', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.put(`/ads/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/ads/${id}`),
  markAsSold: (id: number) => api.post(`/ads/${id}/sold`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// Loyalty APIs
export const loyaltyApi = {
  spin: () => api.post('/loyalty/spin'),
  getTasks: () => api.get('/loyalty/tasks'),
  completeTask: (taskType: string, points: number) => api.post('/loyalty/complete-task', { taskType, points }),
  getPoints: () => api.get('/loyalty/points'),
  getReferralCode: () => api.get('/loyalty/referral'),
  generateReferralCode: () => api.post('/loyalty/generate-referral'),
  redeemReferralCode: (code: string) => api.post('/loyalty/redeem-referral', { referralCode: code }),
  getReferralStats: () => api.get('/loyalty/referral/stats'),
};

// Points Exchange API
export const pointsExchangeApi = {
  getOptions: () => api.get('/pointsExchange'),
  exchange: (data: { optionId: string; amount: number }) =>
    api.post('/pointsExchange/exchange', data),
};

// Wallet API
export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  getRecentWithdrawals: () => api.get('/wallet/recent-withdrawals'),
  requestWithdraw: (data: { method: string; amount: string }) => api.post('/wallet/withdraw', data),
};

// Boost API (will be enhanced below)

// Favorites API
export const favoritesApi = {
  getAll: () => api.get('/favorites/me'),
  toggle: (adId: number) => api.post('/favorites/toggle', { adId }),
  add: (adId: number) => api.post('/favorites/toggle', { adId }),
  remove: (adId: number) => api.post('/favorites/toggle', { adId }),
};

// Recently Viewed API
export const recentlyViewedApi = {
  getAll: () => api.get('/recentlyViewed'),
  add: (adId: number) => api.post('/recentlyViewed', { adId }),
};

// Neighborhood API
export const neighborhoodApi = {
  getFeed: (location?: string) =>
    api.get('/neighborhood/feed', { params: { location } }),
};

// Buyer Request API
export const buyerRequestApi = {
  getAll: () => api.get('/buyerRequest'),
  create: (data: any) => api.post('/buyerRequest', data),
  respond: (requestId: string, adId: number) =>
    api.post(`/buyerRequest/${requestId}/respond`, { adId }),
};

// Swap Request API
export const swapRequestApi = {
  getAll: () => api.get('/swapRequest'),
  getForMyAds: () => api.get('/swaprequest/my-ads'), // Get swap requests for user's ads (lowercase like mobile app)
  getMyAds: () => api.get('/swaprequest/my-ads'),
  create: (data: any) => api.post('/swaprequest', data),
  accept: (id: string) => api.post(`/swaprequest/${id}/accept`),
  reject: (id: string) => api.post(`/swaprequest/${id}/reject`),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/conversations'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  startConversation: (receiverId: string) => api.post(`/conversations/${receiverId}`),
  sendMessage: (data: { conversationId: string; content: string; type?: string }) =>
    api.post('/messages', data),
  sendTextMessage: (conversationId: string, content: string) =>
    api.post(`/messages/${conversationId}/text`, { content }),
  sendFileMessage: (conversationId: string, data: FormData) =>
    api.post(`/messages/${conversationId}/upload`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  sendVoiceMessage: (data: FormData) =>
    api.post('/messages/voice', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  markAsRead: (conversationId: string, messageId: string) =>
    api.post(`/messages/${conversationId}/read/${messageId}`),
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/messages/${conversationId}/${messageId}`),
  deleteConversation: (conversationId: string) =>
    api.delete(`/messages/conversation/${conversationId}`),
};

// Support API
export const supportApi = {
  createTicket: (data: any) => api.post('/support', data),
  getTickets: () => api.get('/support'),
};

// Reports API
export const reportsApi = {
  reportAd: (data: { adId: number; reason: string; userId?: string }) =>
    api.post('/report', data),
  getAll: () => api.get('/report/all'),
  updateStatus: (reportId: string, status: string) =>
    api.put(`/report/status/${reportId}`, { status }),
};

// Seller Rating API
export const sellerRatingApi = {
  rate: (data: { sellerId: string; rating: number; review?: string }) =>
    api.post('/sellerRating', data),
  getRatings: (sellerId: string) => api.get(`/sellerRating/seller/${sellerId}`),
  getMyRatings: () => api.get('/sellerRating/my-ratings'),
};

// Ad Analytics API
export const adAnalyticsApi = {
  getAnalytics: (adId: number) => api.get(`/adAnalytics/${adId}`),
  trackView: (adId: number) => api.post(`/adAnalytics/${adId}/view`),
  trackClick: (adId: number) => api.post(`/adAnalytics/${adId}/click`),
  trackSave: (adId: number) => api.post(`/adAnalytics/${adId}/save`),
  trackShare: (adId: number) => api.post(`/adAnalytics/${adId}/share`),
};

// Ad History API
export const adHistoryApi = {
  getHistory: (adId: number) => api.get(`/adHistory/${adId}`),
};

// Ad Quality API
export const adQualityApi = {
  getScore: (adId: number) => api.get(`/adQuality/${adId}`),
  recalculate: (adId: number) => api.post(`/adQuality/${adId}/recalculate`),
};

// KYC API
export const kycApi = {
  submit: (data: FormData) =>
    api.post('/kyc/submit', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStatus: () => api.get('/kyc/status'),
};

// Notifications API
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Chat Reactions API
export const chatReactionsApi = {
  add: (messageId: string, emoji: string) => api.post(`/chatReaction/message/${messageId}`, { emoji }),
  get: (messageId: string) => api.get(`/chatReaction/message/${messageId}`),
  remove: (messageId: string, emoji: string) => api.delete(`/chatReaction/message/${messageId}/emoji/${emoji}`),
};

// Users API
export const usersApi = {
  getById: (userId: string) => api.get(`/users/${userId}`),
  getSellerDetails: (sellerId: string) => api.get(`/users/${sellerId}`),
};

// Boost API (Enhanced)
export const boostApi = {
  boostAd: (adId: number) => api.post(`/boost/${adId}`),
  generateShareLink: (adId: number) => api.post(`/boost/ad/${adId}/share-link`),
  trackClick: (refCode: string, adId: number) => api.post(`/boost/track-click?refCode=${refCode}&adId=${adId}`),
  getStatus: (adId: number) => api.get(`/boost/ad/${adId}/status`),
};

export default api;

