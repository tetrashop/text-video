import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'داستان به ویدیو',
  description: 'تبدیل داستان متنی به ویدیو با هوش مصنوعی',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
