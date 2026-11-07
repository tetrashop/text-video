'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [rawStory, setRawStory] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [duration, setDuration] = useState(3);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [credits, setCredits] = useState<number | null>(null);
  const [estimatedCredits, setEstimatedCredits] = useState(72);

  useEffect(() => {
    fetch('/api/credits').then(r => r.json()).then(d => {
      if (d.credits !== undefined) setCredits(d.credits);
    });
  }, []);

  useEffect(() => {
    fetch('/api/cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.credits) setEstimatedCredits(d.credits);
      });
  }, [duration]);

  async function handleEnhance() {
    if (!rawStory.trim()) return;
    setEnhancing(true);
    setError(null);
    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: rawStory }),
      });
      const data = await res.json();
      if (data.prompt) {
        setEnhancedPrompt(data.prompt);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnhancing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalPrompt = enhancedPrompt.trim() || rawStory.trim();
    if (!finalPrompt) {
      setError('لطفاً ابتدا داستان یا پرامپت را وارد کنید.');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatusText('در حال ارسال درخواست به Magic Hour...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در شروع تولید');

      const projectId = data.projectId;
      setStatusText(`در حال ساخت ویدیوی ${duration} ثانیه‌ای... (۱ تا ۳ دقیقه)`);

      let consecutiveFailures = 0;
      const checkInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/status?projectId=${projectId}`);
          if (!statusRes.ok) {
            consecutiveFailures++;
            if (consecutiveFailures > 5) {
              clearInterval(checkInterval);
              throw new Error('ارتباط با سرور بیش از حد قطع شد. لطفاً صفحه را رفرش کنید.');
            }
            return;
          }

          consecutiveFailures = 0;
          const statusData = await statusRes.json();

          if (statusData.status === 'complete') {
            clearInterval(checkInterval);
            setVideoUrl(statusData.downloadUrl);
            setStatusText('');
            setLoading(false);
            fetch('/api/credits').then(r => r.json()).then(d => {
              if (d.credits !== undefined) setCredits(d.credits);
            });
          } else if (statusData.status === 'error') {
            clearInterval(checkInterval);
            throw new Error(statusData.message || 'خطا در ساخت');
          }
        } catch (err: any) {
          if (err.message.includes('Failed to fetch')) return;
          clearInterval(checkInterval);
          setError(err.message);
          setLoading(false);
          setStatusText('');
        }
      }, 10000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setStatusText('');
    }
  }

  const hasEnoughCredits = credits === null || credits >= estimatedCredits;

  return (
    <main style={{ maxWidth: 850, margin: '40px auto', padding: 20, fontFamily: 'Tahoma, sans-serif', lineHeight: 1.8 }}>
      <h1 style={{ textAlign: 'center', color: '#0f766e' }}>🎬 داستان به ویدیو (نسخه هوشمند)</h1>
      
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {credits !== null && (
          <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 20, backgroundColor: hasEnoughCredits ? '#ccfbf1' : '#fee2e2', color: hasEnoughCredits ? '#0f766e' : '#b91c1c', fontWeight: 'bold', border: `1px solid ${hasEnoughCredits ? '#5eead4' : '#fca5a5'}` }}>
            💳 موجودی: {credits} اعتبار
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>۱. داستان خود را بنویسید:</label>
        <textarea
          value={rawStory}
          onChange={(e) => setRawStory(e.target.value)}
          placeholder="مثلاً: یک گربه سفید روی پشت‌بام در غروب آفتاب..."
          rows={4}
          required
          style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
        />

        <button
          type="button"
          onClick={handleEnhance}
          disabled={enhancing || !rawStory.trim()}
          style={{ marginTop: 8, padding: '10px 20px', fontSize: 14, background: enhancing ? '#9ca3af' : '#eab308', color: '#000', border: 'none', borderRadius: 8, cursor: enhancing ? 'wait' : 'pointer' }}
        >
          {enhancing ? '⏳ در حال بهینه‌سازی...' : '✨ تبدیل به پرامپت سینمایی (با AI)'}
        </button>

        <label style={{ fontWeight: 'bold', display: 'block', marginTop: 20, marginBottom: 8 }}>۲. پرامپت نهایی (قابل ویرایش):</label>
        <textarea
          value={enhancedPrompt}
          onChange={(e) => setEnhancedPrompt(e.target.value)}
          placeholder="پرامپت انگلیسی تولیدشده توسط هوش مصنوعی اینجا ظاهر می‌شود..."
          rows={4}
          style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box', direction: 'ltr' }}
        />

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontWeight: 'bold', marginRight: 8 }}>مدت زمان:</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ padding: 8, fontSize: 16, borderRadius: 8 }}>
              <option value={3}>۳ ثانیه</option>
              <option value={5}>۵ ثانیه</option>
              <option value={10}>۱۰ ثانیه</option>
            </select>
          </div>
          <div style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: 8 }}>
            💰 هزینه تخمینی: <strong>{estimatedCredits} اعتبار</strong>
          </div>
        </div>

        {!hasEnoughCredits && (
          <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 8 }}>
            ⚠️ اعتبار کافی برای این ویدیو ندارید. (نیاز: {estimatedCredits}، موجودی: {credits})
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !rawStory.trim() || !hasEnoughCredits}
          style={{ marginTop: 20, padding: '14px 32px', fontSize: 18, background: loading || !hasEnoughCredits ? '#9ca3af' : '#0f766e', color: 'white', border: 'none', borderRadius: 8, cursor: loading || !hasEnoughCredits ? 'not-allowed' : 'pointer', width: '100%' }}
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
