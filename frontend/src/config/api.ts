import axios from 'axios';

// Create Axios instance with base URL
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

// ----------------------
// Signup a new user
// ----------------------
export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post('/signup', { name, email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 'Signup failed. Please try again.'
    );
  }
};

// ----------------------
// Fetch saved history
// ----------------------
export const getHistory = async () => {
  const response = await api.get('/history');
  const summaries = response.data.summaries || [];

  const mapped = summaries.map((item: any, index: number) => ({
    id: `${index}`, // fallback ID
    title: item.title,
    url: item.url,
    summary: item.summary,
    timestamp: item.timestamp || item.created_at,
  }));

  return { summaries: mapped };
};

// ----------------------
// Summarize article
// ----------------------
export const summarizeArticle = async (url: string) => {
  try {
    const response = await api.post('/summarize', { url });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 'Failed to summarize article.'
    );
  }
};

// ----------------------
// Delete a summary by URL
// ----------------------
export const deleteSummary = async (url: string) => {
  try {
    const response = await api.delete(`/summary/${encodeURIComponent(url)}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete summary.');
  }
};

// ----------------------
// Rename a summary by URL
// ----------------------
export const renameSummary = async (url: string, title: string) => {
  try {
    const response = await api.put(`/summary/${encodeURIComponent(url)}`, { title });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to rename summary.');
  }
};
