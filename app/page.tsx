'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // استیت‌های جدید برای اعتبار
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // گرفتن موجودی در زمان لود شدن صفحه
  useEffect(() => {
    fetch('/api/credits')
      .then((res) => res.json())
      .then((data) => {
        if (data.credits !== undefined) setCredits(data.credits);
      })
      .catch(() => console.error('خطا در خواندن اعتبار'))
      .finally(() => setLoadingCredits(false));
  }, []);

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
      
      // آپدیت اعتبار بعد از ساخت ویدیو
      fetch('/api/credits').then(r => r.json()).then(d => {
        if (d.credits !== undefined) setCredits(d.credits);
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // حداقل اعتبار لازم برای یک ویدیوی ۳ ثانیه‌ای
  const requiredCredits = 72;
  const hasEnoughCredits = credits === null || credits >= requiredCredits;

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
      
      {/* نمایش باکس اعتبار */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {loadingCredits ? (
          <span style={{ color: '#666' }}>در حال دریافت اعتبار...</span>
        ) : credits !== null ? (
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: 20,
            backgroundColor: hasEnoughCredits ? '#ccfbf1' : '#fee2e2',
            color: hasEnoughCredits ? '#0f766e' : '#b91c1c',
            fontWeight: 'bold',
            border: `1px solid ${hasEnoughCredits ? '#5eead4' : '#fca5a5'}`
          }}>
            💳 موجودی شما: {credits} اعتبار
            {!hasEnoughCredits && ' (کمتر از حد نیاز ۷۲)'}
          </div>
        ) : null}
      </div>

      <p style={{ textAlign: 'center', color: '#666' }}>
        داستان خود را بنویسید تا هوش مصنوعی آن را به ویدیو تبدیل کند.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="مثلاً: A fluffy golden retriever puppy running through a field of tall sunflowers..."
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
        
        {!hasEnoughCredits && (
          <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 8 }}>
            ⚠️ اعتبار کافی برای ساخت ویدیو (۷۲ اعتبار) ندارید. لطفاً تا فردا صبر کنید تا ۱۰۰ اعتبار روزانه شارژ شود.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !story.trim() || !hasEnoughCredits}
          style={{
            marginTop: 12,
            padding: '12px 28px',
            fontSize: 16,
            background: loading || !hasEnoughCredits ? '#9ca3af' : '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading || !hasEnoughCredits ? 'not-allowed' : 'pointer',
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
