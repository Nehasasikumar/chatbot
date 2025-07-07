import React, { useState } from 'react';
import { summarizeArticle } from '@/utils/summarize';

const Summarizer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSummary('');
    setImages([]);
    try {
      const result = await summarizeArticle(url);
      setSummary(
        `Title: ${result.title}\n\nExtractive: ${result.extractive_summary}\n\nAbstractive: ${result.abstractive_summary}`
      );
      setImages(result.images || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSummarize}>
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Enter article URL"
      />
      <button type="submit">Summarize</button>
    </form>
  );
};

export default Summarizer;