# 🎬 داستان به ویدیو (Story to Video)

یک قالب مینیمال و رایگان برای تبدیل داستان متنی به ویدیو با استفاده از **Magic Hour** و ذخیره در **Vercel Blob**.

## ✨ ویژگی‌ها

- **رایگان و بدون کارت اعتباری**: Magic Hour روزانه ۱۰۰ اعتبار رایگان می‌دهد
- **BYOK**: کلید API از حساب خود کاربر استفاده می‌شود
- **UI فارسی**: صفحه ساده و کاربرپسند
- **ذخیره امن**: فایل‌ها در Vercel Blob خصوصی نگهداری می‌شوند

## 🚀 راه‌اندازی محلی

```bash
git clone https://github.com/tetrashop/text-video.git
cd text-video
npm install
cp .env.example .env.local
# سپس .env.local را با کلیدهای واقعی ویرایش کنید
npm run dev
```

سپس http://localhost:3000 را باز کنید.

🔑 دریافت کلیدها

1. Magic Hour: از magichour.ai/developer ثبت‌نام کنید (رایگان) و API Key بسازید
2. Vercel Blob: از داشبورد Vercel > Storage > Blob یک استور بسازید (خصوصی) و توکن بگیرید

⚙️ متغیرهای محیطی

نام مقدار
MAGIC_HOUR_API_KEY کلید API از Magic Hour
BLOB_READ_WRITE_TOKEN توکن Vercel Blob

☁️ دیپلوی روی Vercel

https://vercel.com/button

بعد از دیپلوی، در Settings > Environment Variables دو متغیر بالا را اضافه کنید.

⚠️ محدودیت‌ها

· مدت هر ویدیو: ۵ ثانیه
· کیفیت: 480p (در پلن رایگان)
· زمان تولید: ۱ تا ۵ دقیقه
· Magic Hour روزانه ۱۰۰ اعتبار رایگان می‌دهد (هر ویدیوی ۵ ثانیه‌ای = ۱۲۰ اعتبار)

📄 لایسنس

MIT
