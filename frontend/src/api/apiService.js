import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || '',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('user');
  const token = stored ? JSON.parse(stored).token : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatApi = {
  sendMessage: (message, history = []) => 
    api.post('/api/chat', { message, history }),
  
  getChatHistory: () => 
    api.get('/chat'),
  
  getChat: (id) => 
    api.get(`/chat/${id}`),
  
  createChat: () => 
    api.post('/chat/new'),
  
  askQuestion: (chatId, question) => 
    api.post(`/chat/${chatId}`, { question })
};

export const authApi = {
  login: (userData) => 
    api.post('/user/login', userData),
  
  register: (userData) => 
    api.post('/user/register', userData),
  
  logout: () => {
    localStorage.removeItem('user');
  }
};

export default {
  chat: chatApi,
  auth: authApi,
  dashboard: dashboardApi
};