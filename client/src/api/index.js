import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const leadAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  getPipeline: () => api.get('/leads/pipeline'),
  getStages: () => api.get('/leads/stages'),
  updateStages: (data) => api.put('/leads/stages', data),
  addActivity: (id, data) => api.post(`/leads/${id}/activities`, data),
  assignLead: (id, data) => api.put(`/leads/${id}/assign`, data),
  updateStage: (id, data) => api.put(`/leads/${id}/stage`, data),
  convert: (id) => api.post(`/leads/${id}/convert`),
  exportLeads: (params) => api.get('/leads/export', { params, responseType: 'blob' }),
  bulkImport: (data) => api.post('/leads/bulk-import', data),
  bulkUpdate: (data) => api.post('/leads/bulk-update', data),
  bulkDelete: (data) => api.post('/leads/bulk-delete', data),
};

export const contactAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const dealAPI = {
  getAll: (params) => api.get('/deals', { params }),
  getById: (id) => api.get(`/deals/${id}`),
  create: (data) => api.post('/deals', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  delete: (id) => api.delete(`/deals/${id}`),
};

export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
};

export const reportAPI = {
  getDashboard: (params) => api.get('/reports/dashboard', { params }),
};

export const settingsAPI = {
  getCustomFields: (module) => api.get(`/settings/custom-fields/${module}`),
  createCustomField: (data) => api.post('/settings/custom-fields', data),
  updateCustomField: (id, data) => api.put(`/settings/custom-fields/${id}`, data),
  deleteCustomField: (id) => api.delete(`/settings/custom-fields/${id}`),
  getSmtp: () => api.get('/settings/smtp'),
  updateSmtp: (data) => api.put('/settings/smtp', data),
};

export const whatsAppAPI = {
  getAll: (params) => api.get('/whatsapp', { params }),
  send: (data) => api.post('/whatsapp/send', data),
};

export const roleAPI = {
  getAll: () => api.get('/roles'),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  getUsers: () => api.get('/roles/users'),
  updateUser: (id, data) => api.put(`/roles/users/${id}`, data),
};
