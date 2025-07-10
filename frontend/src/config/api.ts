// src/config/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached:", token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch saved history and add a fallback `id` field
export const getHistory = async () => {
  const response = await api.get('/history');
  const summaries = response.data.summaries || [];

  const mapped = summaries.map((item: any, index: number) => ({
    id: `${index}`, // Your backend does NOT return id, so we add it here
    title: item.title,
    url: item.url,
    summary: item.summary,
    timestamp: item.timestamp || item.created_at,
  }));

  return { summaries: mapped };
};

// Send URL for summarization
export const summarizeArticle = async (url: string) => {
  try {
    const response = await api.post('/summarize', { url });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to summarize article.');
  }
};
