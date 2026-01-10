import axios from 'axios';

const API_BASE = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generate demo session ID for offline users
const getDemoSessionId = () => {
  let sessionId = localStorage.getItem('demo_session_id');
  if (!sessionId) {
    sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('demo_session_id', sessionId);
  }
  return sessionId;
};

export const api = {
  // ==========================================
  // AUTH ENDPOINTS
  // ==========================================
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

  async updatePassword(currentPassword, newPassword) {
    const response = await axios.put(`${API_BASE}/auth/password`, 
      { currentPassword, newPassword },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // ==========================================
  // PROFILE ENDPOINTS
  // ==========================================
  async getProfile() {
    const response = await axios.get(`${API_BASE}/profile`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async updateProfile(updates) {
    const response = await axios.put(`${API_BASE}/profile`, updates, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async updateAvatar(avatarData) {
    const response = await axios.put(`${API_BASE}/profile/avatar`, 
      { avatar: avatarData },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  async removeAvatar() {
    const response = await axios.delete(`${API_BASE}/profile/avatar`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async deleteAccount(confirmEmail) {
    const response = await axios.delete(`${API_BASE}/profile`, {
      headers: getAuthHeader(),
      data: { confirmEmail }
    });
    return response.data;
  },

  // ==========================================
  // SETTINGS ENDPOINTS
  // ==========================================
  async getSettings() {
    const response = await axios.get(`${API_BASE}/settings`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async updateSettings(settings) {
    const response = await axios.put(`${API_BASE}/settings`, settings, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async resetSettings() {
    const response = await axios.put(`${API_BASE}/settings/reset`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // ==========================================
  // DASHBOARD ENDPOINTS
  // ==========================================
  async getDashboard() {
    const response = await axios.get(`${API_BASE}/dashboard`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async getQuickStats() {
    const response = await axios.get(`${API_BASE}/dashboard/quick-stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // ==========================================
  // HISTORY ENDPOINTS
  // ==========================================
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

  // ==========================================
  // CUSTOM GRAPHS ENDPOINTS
  // ==========================================
  async createGraph(graphData) {
    const sessionId = getDemoSessionId();
    const response = await axios.post(`${API_BASE}/graphs`, 
      { ...graphData, sessionId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  async getGraphs(page = 1, limit = 20) {
    const response = await axios.get(`${API_BASE}/graphs?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async getDemoGraphs() {
    const sessionId = getDemoSessionId();
    const response = await axios.get(`${API_BASE}/graphs/demo/${sessionId}`);
    return response.data;
  },

  async getGraph(id) {
    const response = await axios.get(`${API_BASE}/graphs/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async updateGraph(id, updates) {
    const response = await axios.put(`${API_BASE}/graphs/${id}`, updates, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async deleteGraph(id) {
    const response = await axios.delete(`${API_BASE}/graphs/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async duplicateGraph(id) {
    const response = await axios.post(`${API_BASE}/graphs/${id}/duplicate`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // ==========================================
  // CORE EXTRACTION ENDPOINTS
  // ==========================================
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

  // ==========================================
  // GITHUB ENDPOINTS
  // ==========================================
  async analyzeGitHub(url) {
    const response = await axios.post(`${API_BASE}/github/analyze`, { url }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async analyzeInDepth(sectionName, concepts, relationships, repoInfo) {
    const response = await axios.post(`${API_BASE}/github/analyze-depth`, {
      sectionName,
      concepts,
      relationships,
      repoInfo,
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  async validateGitHubUrl(url) {
    const response = await axios.get(`${API_BASE}/github/validate?url=${encodeURIComponent(url)}`);
    return response.data;
  },

  // ==========================================
  // UTILITY ENDPOINTS
  // ==========================================
  async healthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  },

  // Helper to get demo session ID
  getDemoSessionId
};

export default api;
