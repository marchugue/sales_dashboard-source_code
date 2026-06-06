import axios from 'axios';

// Use environment variable or fallback to production backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sales-api-hhyf.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry logic for network errors
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        return await api(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          console.error('Unauthorized access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data?.message || 'Unknown error');
      }
    }

    return Promise.reject(error);
  }
);

// Dashboard API endpoints
export const dashboardAPI = {
  // KPI Summary
  getKPISummary: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    
    const response = await api.get(`/dashboard/kpi?${params}`);
    return response.data;
  },

  // Sales Trend
  getSalesTrend: async (period = 'daily', filters = {}) => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    
    const response = await api.get(`/dashboard/trend?${params}`);
    return response.data;
  },

  // Category Breakdown
  getCategoryBreakdown: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.region) params.append('region', filters.region);
    
    const response = await api.get(`/dashboard/categories?${params}`);
    return response.data;
  },

  // Region Analysis
  getRegionAnalysis: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    
    const response = await api.get(`/dashboard/regions?${params}`);
    return response.data;
  },

  // Top Products
  getTopProducts: async (limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    
    const response = await api.get(`/dashboard/top-products?${params}`);
    return response.data;
  },

  // Raw Data
  getRawData: async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    const params = new URLSearchParams();
    params.append('page', pagination.page);
    params.append('limit', pagination.limit);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    if (filters.product) params.append('product', filters.product);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/dashboard/raw-data?${params}`);
    return response.data;
  },

  // Filter Options
  getFilterOptions: async () => {
    const response = await api.get('/dashboard/filters');
    return response.data;
  },

  // Insights
  getInsights: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    
    const response = await api.get(`/dashboard/insights?${params}`);
    return response.data;
  },

  // Export CSV
  exportCSV: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    if (filters.product) params.append('product', filters.product);
    
    const response = await api.get(`/dashboard/export/csv?${params}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales-data.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Health Check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
