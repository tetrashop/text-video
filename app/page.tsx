// app/page.tsx (فقط بخش handleSubmit را جایگزین کنید)
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatusText('در حال ارسال درخواست به هوش مصنوعی...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در شروع تولید');

      const projectId = data.projectId;
      setStatusText('در حال ساخت ویدیو... (این مرحله ۱ تا ۳ دقیقه طول می‌کشد)');

      let consecutiveFailures = 0;
      const checkInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/status?projectId=${projectId}`);
          
          if (!statusRes.ok) {
            // اگر خطای سرور بود (مثلاً 500)، آن را نادیده بگیر و دوباره تلاش کن
            consecutiveFailures++;
            if (consecutiveFailures > 5) {
              clearInterval(checkInterval);
              throw new Error('ارتباط با سرور بیش از حد قطع شد. لطفاً صفحه را رفرش کنید.');
            }
            return; 
          }

          // اگر پاسخ موفق بود، شمارنده خطا را صفر کن
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
          // اگر خطای شبکه بود (Failed to fetch)، فقط لاگ کن و بگذار حلقه ادامه یابد
          if (err.message.includes('Failed to fetch')) {
            console.warn('Network error, retrying...');
            return;
          }
          // برای سایر خطاها، حلقه را متوقف کن
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
