import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const importAPI = {
  triggerSync: () => api.post('/import/sync', {}),
  getProgress: () => api.get('/import/progress'),
};

export const customerAPI = {
  getAll: (page: number = 1, limit: number = 50) =>
    api.get(`/customer?page=${page}&limit=${limit}`),
  getRecent: (limit: number = 20) =>
    api.get(`/customer/recent?limit=${limit}`),
  getOne: (id: string) => api.get(`/customer/${id}`),
  create: (data: any) => api.post('/customer', data),
  update: (id: string, data: any) => api.patch(`/customer/${id}`, data),
  delete: (id: string) => api.delete(`/customer/${id}`),
};
