import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ABS School Management ERP Dashboard',
  description: 'Enterprise School Management Dashboard for ABS School (LKG to 12th Standard)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
