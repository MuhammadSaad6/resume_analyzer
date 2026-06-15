import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Smart Resume Analyzer',
  description: 'AI resume analysis dashboard with Gemini, PDF upload, ATS scoring, and career insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function() {
            try {
              var stored = window.localStorage.getItem('theme');
              var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
              document.documentElement.dataset.theme = theme;
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch (error) {}
          })();
        `}</Script>
      </head>
      <body>
        <div className="min-h-screen selection:bg-cyan-500 selection:text-slate-950">
          {children}
        </div>
      </body>
    </html>
  );
}
