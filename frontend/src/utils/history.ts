import { getToken } from './auth';  // update path if needed

export async function fetchHistory() {
  const token = getToken();  // use auth helper

  if (!token) throw new Error('User not logged in');

  const response = await fetch('http://localhost:5000/history', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch history');
  }

  return await response.json();
}
