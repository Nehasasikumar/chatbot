import api from '../config/api'; // ✅ FIXED: relative path

export async function summarizeArticle(url: string) {
  const response = await api.post('/summarize', { url });
  return response.data;
}
