import axios from 'axios';

const API_BASE = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async register(name, email, password) {
    const response = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return response.data;
  },

  async getMe() {
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async updateProfile(updates) {
    const response = await axios.put(`${API_BASE}/auth/profile`, updates, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await axios.put(`${API_BASE}/auth/password`, 
      { currentPassword, newPassword },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  async getHistory(page = 1, limit = 10) {
    const response = await axios.get(`${API_BASE}/history?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async getHistoryStats() {
    const response = await axios.get(`${API_BASE}/history/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async getHistoryItem(id) {
    const response = await axios.get(`${API_BASE}/history/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async saveToHistory(title, sourceType, sourcePreview, graphData) {
    const response = await axios.post(`${API_BASE}/history`, 
      { title, sourceType, sourcePreview, graphData },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  async deleteHistoryItem(id) {
    const response = await axios.delete(`${API_BASE}/history/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async clearHistory() {
    const response = await axios.delete(`${API_BASE}/history`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async extractFromText(text, options = {}) {
    const response = await axios.post(`${API_BASE}/extract`, { text, options }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async uploadPDF(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader()
      }
    });
    return response.data;
  },

  async refineGraph(text, concepts, relationships, maxIterations = 2) {
    const response = await axios.post(`${API_BASE}/refine`, {
      text,
      concepts,
      relationships,
      maxIterations
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async healthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }
};

export default api;
