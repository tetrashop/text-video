'use client';

import { useState } from 'react';

export default function Home() {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'خطای ناشناخته');
      setVideoUrl(data.downloadUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 800,
        margin: '40px auto',
        padding: 20,
        fontFamily: 'Tahoma, sans-serif',
        lineHeight: 1.8,
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#0f766e' }}>🎬 داستان به ویدیو</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        داستان خود را بنویسید تا هوش مصنوعی آن را به ویدیو تبدیل کند.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="مثلاً: یک گربه سفید روی پشت‌بام در غروب آفتاب، سینمایی"
          rows={6}
          required
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={loading || !story.trim()}
          style={{
            marginTop: 12,
            padding: '12px 28px',
            fontSize: 16,
            background: loading ? '#999' : '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? '⏳ در حال تولید (تا ۵ دقیقه)...' : '🚀 تولید ویدیو'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            color: '#b91c1c',
          }}
        >
          <strong>خطا:</strong> {error}
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ color: '#0f766e' }}>✅ ویدیوی شما آماده است!</h2>
          <video
            src={videoUrl}
            controls
            style={{ width: '100%', borderRadius: 12, background: '#000' }}
          />
          <a
            href={videoUrl}
            download="video.mp4"
            style={{
              display: 'inline-block',
              marginTop: 12,
              padding: '10px 20px',
              background: '#0f766e',
              color: 'white',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            ⬇️ دانلود ویدیو
          </a>
        </div>
      )}
    </main>
  );
}
