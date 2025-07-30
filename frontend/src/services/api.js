import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Memo API functions
export const memoApi = {
  // Get all memos
  async getMemos() {
    try {
      const response = await api.get('/memos');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch memos:', error);
      throw new Error('Failed to fetch memos');
    }
  },

  // Create a new memo
  async createMemo(memoData) {
    try {
      const response = await api.post('/memos', memoData);
      return response.data;
    } catch (error) {
      console.error('Failed to create memo:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create memo');
    }
  },

  // Update a memo
  async updateMemo(memoId, updateData) {
    try {
      const response = await api.put(`/memos/${memoId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update memo:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update memo');
    }
  },

  // Delete a memo
  async deleteMemo(memoId) {
    try {
      await api.delete(`/memos/${memoId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete memo:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete memo');
    }
  },

  // Toggle memo alarm
  async toggleAlarm(memoId) {
    try {
      const response = await api.post(`/memos/${memoId}/toggle-alarm`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle alarm:', error);
      throw new Error(error.response?.data?.detail || 'Failed to toggle alarm');
    }
  }
};

// Image API functions
export const imageApi = {
  // Upload image file
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(error.response?.data?.detail || 'Failed to upload image');
    }
  },

  // Upload base64 image (for camera captures)
  async uploadBase64Image(base64Data, filename = 'camera-capture.jpg') {
    try {
      const formData = new FormData();
      formData.append('image_data', base64Data);
      formData.append('filename', filename);
      
      const response = await api.post('/upload-base64-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload base64 image:', error);
      throw new Error(error.response?.data?.detail || 'Failed to upload image');
    }
  },

  // Get image URL
  getImageUrl(filename) {
    return `${API_BASE}/images/${filename}`;
  }
};

export default api;