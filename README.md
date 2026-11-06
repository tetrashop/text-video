# 🎬 Story to Video (BYOK - Bring Your Own Key)

یک قالب مینیمال و زیبا برای تبدیل داستان متنی به ویدیو با استفاده از **Magic Hour** و ذخیره‌سازی خودکار در **Vercel Blob**.

این پروژه به گونه‌ای طراحی شده است که بدون نیاز به سرورهای سنگین، با استفاده از معماری Serverless روی Vercel اجرا شود و با محدودیت‌های زمانی پلن رایگان (Timeout) کاملاً سازگار است.

## ✨ ویژگی‌ها

- **BYOK (کلید خودت را بیاور)**: هزینه و کلید API از حساب خود شما استفاده می‌شود.
- **رایگان**: Magic Hour روزانه ۱۰۰ اعتبار رایگان می‌دهد (بدون نیاز به کارت اعتباری).
- **مقاوم در برابر Timeout**: با استفاده از معماری Polling (نظرسنجی سمت کلاینت)، مشکل محدودیت ۶۰ ثانیه‌ای Vercel حل شده است.
- **اعتبارسنج هوشمند**: نمایش موجودی اعتبار کاربر و جلوگیری از درخواست‌های ناموفق.
- **ذخیره امن**: ویدیوهای تولیدشده در Vercel Blob (به صورت خصوصی) ذخیره می‌شوند.

## 🚀 راه‌اندازی محلی (Local)

```bash
git clone https://github.com/tetrashop/text-video.git
cd text-video
npm install
cp .env.example .env.local
# سپس .env.local را با کلیدهای واقعی ویرایش کنید
npm run dev
```

سپس آدرس http://localhost:3000 را باز کنید.

🔑 دریافت کلیدها

1. Magic Hour: از magichour.ai/developer ثبت‌نام کنید (رایگان) و یک API Key بسازید.
2. Vercel Blob: از داشبورد Vercel > Storage > Blob یک استور بسازید (خصوصی) و توکن بگیرید.

⚙️ متغیرهای محیطی

نام مقدار
MAGIC_HOUR_API_KEY کلید API از Magic Hour
BLOB_READ_WRITE_TOKEN توکن Vercel Blob

☁️ دیپلوی روی Vercel

https://vercel.com/button

پس از دیپلوی، در تنظیمات پروژه در Vercel (بخش Environment Variables) دو متغیر بالا را وارد کنید.

⚠️ محدودیت‌ها

· مدت هر ویدیو: ۳ تا ۵ ثانیه (بسته به مدل).
· کیفیت: 480p (در پلن رایگان).
· هزینه: هر ویدیوی ۳ ثانیه‌ای حدود ۷۲ اعتبار از Magic Hour مصرف می‌کند.

📄 لایسنس

MIT
