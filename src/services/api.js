import axios from 'axios';

const API_URL = 'http://localhost:9000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Update with more debugging and options
export const authAPI = {
  login: (email, password) => {
    console.log("API login call with:", { email, password });
    return apiClient.post('/user/loginUser', { email, password });
  }
};

// Products API - Improved for handling file uploads
export const productAPI = {
  getAll: () => apiClient.get('/product/getAllProducts'),
  getById: (id) => apiClient.get(`/product/getProductByID/${id}`),
  create: (formData) => {
    // Special headers for multipart/form-data
    return apiClient.post('/product/createProduct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  update: (id, formData) => {
    // Special headers for multipart/form-data
    return apiClient.put(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  delete: (id) => apiClient.delete(`/product/${id}`),
  getByCategory: (catId) => apiClient.get(`/product/category/${catId}`),
  getByPriceRange: (min, max) => apiClient.get(`/product/filter/price?minPrice=${min}&maxPrice=${max}`)
};

// Categories API
export const categoryAPI = {
  getAll: () => apiClient.get('/category'),
  getById: (id) => apiClient.get(`/category/${id}`),
  create: (formData) => apiClient.post('/category/createCategory', formData),
  update: (id, formData) => apiClient.put(`/category/updateCategory/${id}`, formData),
  delete: (id) => apiClient.delete(`/category/deleteCategory/${id}`)
};

// Users API
export const userAPI = {
  getAll: () => apiClient.get('/user/all'),
  getById: (id) => apiClient.get(`/user/${id}`),
  createAdmin: (userData) => apiClient.post('/user/createAdmin', userData),
  update: (id, userData) => apiClient.put(`/user/${id}`, userData),
  delete: (id) => apiClient.delete(`/user/${id}`)
};

// Orders API - Update this section
export const orderAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (orderData) => apiClient.post('/orders', orderData),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/orders/${id}`),
  getStats: () => apiClient.get('/orders/stats'),
  getMonthlyRevenue: () => apiClient.get('/orders/monthly-revenue')
};

// Dashboard statistics API - Update this section
export const statsAPI = {
  getStats: async () => {
    try {
      // Get all the stats we need
      const [products, categories, orderStats] = await Promise.all([
        apiClient.get('/product/getAllProducts'),
        apiClient.get('/category'),
        apiClient.get('/orders/stats')
      ]);
      
      // Get users count from users endpoint
      let users = [];
      try {
        const usersRes = await apiClient.get('/user/all');
        users = usersRes.data || [];
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
      
      return {
        productsCount: products.data.length,
        categoriesCount: categories.data.length,
        usersCount: users.length,
        ordersCount: orderStats.data.totalOrders || 0,
        revenue: orderStats.data.totalRevenue || 0,
        recentOrders: orderStats.data.recentOrders || [],
        ordersByStatus: orderStats.data.statusCounts || {}
      };
    } catch (err) {
      console.error('Error fetching stats:', err);
      throw err;
    }
  }
};

export default apiClient;
