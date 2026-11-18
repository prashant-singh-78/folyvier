const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/') && API_BASE) {
    return `${API_BASE}${url}`;
  }
  return url;
}

export function getAuthToken() {
  return localStorage.getItem('folibeir_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('folibeir_token', token);
  } else {
    localStorage.removeItem('folibeir_token');
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token && options.auth !== false) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // Sends/receives HTTP-only secure session cookies
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const errMsg =
      typeof data === 'object'
        ? data?.detail || data?.error || `Request failed (${res.status})`
        : `Request failed (${res.status})`;
    const error = new Error(Array.isArray(errMsg) ? errMsg[0]?.msg || 'Validation error' : errMsg);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  // Public
  getBootstrap: () => request('/api/public/bootstrap', { auth: false }),
  getConditions: () => request('/api/public/conditions', { auth: false }),
  getConditionDetail: (slugOrCode) => request(`/api/public/conditions/${slugOrCode}`, { auth: false }),
  getProducts: (conditionCode = '') =>
    request(`/api/public/products${conditionCode ? `?condition_code=${conditionCode}` : ''}`, { auth: false }),
  submitContact: (payload) => request('/api/public/contact', { method: 'POST', body: payload, auth: false }),

  // Auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  googleLogin: (payload) => request('/api/auth/google', { method: 'POST', body: payload, auth: false }),
  resetPassword: (payload) => request('/api/auth/reset-password', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me'),

  // User Dashboard & Assessment (Dual WhatsApp Automation)
  getUserDashboard: () => request('/api/user/dashboard'),
  updateProfile: (payload) => request('/api/user/profile', { method: 'PUT', body: payload }),
  submitAssessment: (payload) => request('/api/user/assessments', { method: 'POST', body: payload }),

  // Chatbot
  initChatbot: () => request('/api/chatbot/init', { auth: false }),
  sendChatMessage: (payload) => request('/api/chatbot/message', { method: 'POST', body: payload }),
  confirmConditionFromChat: (payload) =>
    request('/api/chatbot/confirm-condition', { method: 'POST', body: payload }),

  // Super Admin (No CRM)
  getAdminStats: () => request('/api/admin/stats'),
  getAdminUsers: () => request('/api/admin/users'),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/api/admin/upload', { method: 'POST', body: form });
  },
  getAdminProducts: () => request('/api/admin/products'),
  createProduct: (payload) => request('/api/admin/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/api/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  updateTechnology: (payload) => request('/api/admin/technology', { method: 'PUT', body: payload }),
  getAdminConditions: () => request('/api/admin/conditions'),
  updateCondition: (code, payload) => request(`/api/admin/conditions/${code}`, { method: 'PUT', body: payload }),
  getWhatsAppSettings: () => request('/api/admin/whatsapp/settings'),
  updateWhatsAppSettings: (payload) => request('/api/admin/whatsapp/settings', { method: 'PUT', body: payload }),
  getWhatsAppMessages: (statusFilter = 'all') =>
    request(`/api/admin/whatsapp/messages?status_filter=${statusFilter}`),
  retryWhatsAppMessage: (messageId) =>
    request(`/api/admin/whatsapp/messages/${messageId}/retry`, { method: 'POST' }),
};
