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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('abs_school_erp_ui_store_v2') || localStorage.getItem('abs_school_erp_ui_store_v1');
                  var theme = 'light';
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.state && parsed.state.theme) {
                      theme = parsed.state.theme;
                    }
                  }
                  var root = document.documentElement;
                  root.classList.remove('dark', 'theme-blue');
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else if (theme === 'blue') {
                    root.classList.add('theme-blue');
                  } else if (theme === 'auto') {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      root.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
