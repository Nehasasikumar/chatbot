import { getToken } from './auth';  // make sure this is the correct path

export async function summarizeArticle(url: string) {
  const token = getToken();  // use utility function

  if (!token) throw new Error('User not logged in');

  const response = await fetch('http://localhost:5000/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Summary failed');
  }

  return await response.json();
}
