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
  const chats = response.data.chats || [];

  const mapped = chats.map((item: any) => ({
    id: item.id,
    title: item.title,
    messages: item.messages,
    timestamp: item.timestamp || item.created_at,
  }));

  return { chats: mapped };
};

// ----------------------
// Summarize article
// ----------------------
export const summarizeArticle = async (url: string, chat_id: string | undefined, messages: any[]) => {
  try {
    const response = await api.post('/summarize', { url, chat_id, messages });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 'Failed to summarize article.'
    );
  }
};

// ----------------------
// Delete a summary by ID
// ----------------------
export const deleteSummary = async (id: string) => {
  try {
    const response = await api.delete(`/summary/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete summary.');
  }
};

// ----------------------
// Rename a summary by ID
// ----------------------
export const renameSummary = async (id: string, title: string) => {
  try {
    const response = await api.put(`/summary/${id}`, { title });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to rename summary.');
  }
};
