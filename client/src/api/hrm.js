import api from './axios';

export const employeeAPI = {
  getAll: (params) => api.get('/hrm/employees', { params }),
  getById: (id) => api.get(`/hrm/employees/${id}`),
  create: (data) => api.post('/hrm/employees', data),
  update: (id, data) => api.put(`/hrm/employees/${id}`, data),
  delete: (id) => api.delete(`/hrm/employees/${id}`),
};

export const attendanceAPI = {
  getAll: (params) => api.get('/hrm/attendance', { params }),
  checkIn: () => api.post('/hrm/attendance/checkin'),
  checkOut: () => api.post('/hrm/attendance/checkout'),
};

export const leaveAPI = {
  getAll: (params) => api.get('/hrm/leaves', { params }),
  create: (data) => api.post('/hrm/leaves', data),
  approve: (id, data) => api.put(`/hrm/leaves/${id}/approve`, data),
};
