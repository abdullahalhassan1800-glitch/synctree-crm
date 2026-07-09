import api from './axios';

export const workflowAPI = {
  getAll: () => api.get('/automation'),
  getById: (id) => api.get(`/automation/${id}`),
  create: (data) => api.post('/automation', data),
  update: (id, data) => api.put(`/automation/${id}`, data),
  delete: (id) => api.delete(`/automation/${id}`),
  toggle: (id) => api.put(`/automation/${id}/toggle`),
  test: (id, data) => api.post(`/automation/${id}/test`, data),
};

export const emailTemplateAPI = {
  getAll: () => api.get('/automation/templates'),
  create: (data) => api.post('/automation/templates', data),
  update: (id, data) => api.put(`/automation/templates/${id}`, data),
  delete: (id) => api.delete(`/automation/templates/${id}`),
};

export const automationLogAPI = {
  getAll: (params) => api.get('/automation/logs', { params }),
};
