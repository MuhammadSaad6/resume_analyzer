'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const currentTheme = document.documentElement.dataset.theme as 'dark' | 'light' | undefined;
    const initial = currentTheme === 'light' || currentTheme === 'dark'
      ? currentTheme
      : stored === 'light' || stored === 'dark'
        ? stored
        : 'dark';
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem('theme', next);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-400/40 hover:text-cyan-100 dark:bg-slate-100/15 dark:text-slate-900"
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
