import api from '@/config/api';

export async function fetchHistory() {
  const response = await api.get('/history');
  return response.data;
}