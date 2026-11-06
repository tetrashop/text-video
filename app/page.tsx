'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/credits').then(r => r.json()).then(d => {
      if (d.credits !== undefined) setCredits(d.credits);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatusText('در حال ارسال درخواست به هوش مصنوعی...');

    try {
      // ۱. ارسال درخواست
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در شروع تولید');

      const projectId = data.projectId;
      setStatusText('در حال ساخت ویدیو... (این مرحله ۱ تا ۳ دقیقه طول می‌کشد)');

      // ۲. شروع بررسی وضعیت هر ۱۰ ثانیه
      const checkInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/status?projectId=${projectId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'complete') {
            clearInterval(checkInterval);
            setVideoUrl(statusData.downloadUrl);
            setStatusText('');
            setLoading(false);
            // آپدیت اعتبار
            fetch('/api/credits').then(r => r.json()).then(d => {
              if (d.credits !== undefined) setCredits(d.credits);
            });
          } else if (statusData.status === 'error') {
            clearInterval(checkInterval);
            throw new Error(statusData.message || 'خطا در ساخت');
          }
        } catch (err: any) {
          clearInterval(checkInterval);
          setError(err.message);
          setLoading(false);
        }
      }, 10000); // هر ۱۰,۰۰۰ میلی‌ثانیه (۱۰ ثانیه)

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setStatusText('');
    }
  }

  const requiredCredits = 72;
  const hasEnoughCredits = credits === null || credits >= requiredCredits;

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 20, fontFamily: 'Tahoma, sans-serif', lineHeight: 1.8 }}>
      <h1 style={{ textAlign: 'center', color: '#0f766e' }}>🎬 داستان به ویدیو</h1>
      
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {credits !== null && (
          <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 20, backgroundColor: hasEnoughCredits ? '#ccfbf1' : '#fee2e2', color: hasEnoughCredits ? '#0f766e' : '#b91c1c', fontWeight: 'bold', border: `1px solid ${hasEnoughCredits ? '#5eead4' : '#fca5a5'}` }}>
            💳 موجودی: {credits} اعتبار
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="داستان خود را اینجا بنویسید..."
          rows={5}
          required
          style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        
        {!hasEnoughCredits && (
          <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 8 }}>
            ⚠️ اعتبار کافی برای ساخت ویدیو (۷۲ اعتبار) ندارید.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !story.trim() || !hasEnoughCredits}
          style={{ marginTop: 12, padding: '12px 28px', fontSize: 16, background: loading || !hasEnoughCredits ? '#9ca3af' : '#0f766e', color: 'white', border: 'none', borderRadius: 8, cursor: loading || !hasEnoughCredits ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '⏳ در حال پردازش...' : '🚀 تولید ویدیو'}
        </button>
      </form>

      {statusText && (
        <div style={{ marginTop: 20, padding: 12, background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: 8, color: '#0369a1', textAlign: 'center' }}>
          <strong>{statusText}</strong>
          <div style={{ fontSize: 12, marginTop: 4 }}>لطفاً صفحه را نبندید...</div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, padding: 12, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c' }}>
          <strong>خطا:</strong> {error}
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ color: '#0f766e' }}>✅ ویدیوی شما آماده است!</h2>
          <video src={videoUrl} controls style={{ width: '100%', borderRadius: 12, background: '#000' }} />
          <a href={videoUrl} download="video.mp4" style={{ display: 'inline-block', marginTop: 12, padding: '10px 20px', background: '#0f766e', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
            ⬇️ دانلود ویدیو
          </a>
        </div>
      )}
    </main>
  );
}
