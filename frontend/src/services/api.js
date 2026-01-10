import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/login/access-token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Items API
export const itemsAPI = {
  getAll: async (skip = 0, limit = 100, name = null) => {
    const params = { skip, limit };
    if (name) params.name = name;
    const response = await api.get('/items', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/orders', { params: { skip, limit } });
    return response.data;
  },
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
};

// Vouchers API
export const vouchersAPI = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/vouchers', { params: { skip, limit } });
    return response.data;
  },
  create: async (voucherData) => {
    const response = await api.post('/vouchers', voucherData);
    return response.data;
  },
  delete: async (voucherId) => {
    const response = await api.delete(`/vouchers/${voucherId}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/users', { params: { skip, limit } });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  register: async (email, password, fullName) => {
    const response = await api.post('/users/open', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },
};

// Admin Items API
export const adminItemsAPI = {
  create: async (itemData) => {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('price', itemData.price);
    if (itemData.description) formData.append('description', itemData.description);
    if (itemData.discount) formData.append('discount', itemData.discount);
    if (itemData.category && itemData.category.length > 0) {
      formData.append('category', itemData.category.join(','));
    }
    if (itemData.flavour && itemData.flavour.length > 0) {
      formData.append('flavour', itemData.flavour.join(','));
    }
    if (itemData.image) formData.append('image', itemData.image);

    const response = await api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // Note: Backend may need PUT and DELETE endpoints for items
  // These endpoints might not exist yet in the backend
  update: async (itemId, itemData) => {
    const formData = new FormData();
    if (itemData.title) formData.append('title', itemData.title);
    if (itemData.price) formData.append('price', itemData.price);
    if (itemData.description !== undefined) formData.append('description', itemData.description || '');
    if (itemData.discount !== undefined) formData.append('discount', itemData.discount || '');
    if (itemData.category && Array.isArray(itemData.category) && itemData.category.length > 0) {
      formData.append('category', itemData.category.join(','));
    }
    if (itemData.flavour && Array.isArray(itemData.flavour) && itemData.flavour.length > 0) {
      formData.append('flavour', itemData.flavour.join(','));
    }
    if (itemData.image) formData.append('image', itemData.image);
    if (itemData.is_active !== undefined) formData.append('is_active', itemData.is_active);

    try {
      const response = await api.put(`/items/${itemId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error('Endpoint PUT /items/:id chưa được implement trong backend');
      }
      throw error;
    }
  },
  delete: async (itemId) => {
    try {
      const response = await api.delete(`/items/${itemId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error('Endpoint DELETE /items/:id chưa được implement trong backend');
      }
      throw error;
    }
  },
};

// Shipping API
export const shippingAPI = {
  getConfig: async () => {
    const response = await api.get('/shipping');
    return response.data;
  },
  updateConfig: async (configData) => {
    const response = await api.put('/shipping', configData);
    return response.data;
  },
};

export default api;
