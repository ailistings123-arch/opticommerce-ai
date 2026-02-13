'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <button
        className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-all duration-300"
        aria-label="Toggle theme"
        disabled
      >
        <div className="relative w-6 h-6">
          <Sun className="absolute inset-0 text-yellow-500" size={24} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun 
          className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${
            theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`}
          size={24}
        />
        <Moon 
          className={`absolute inset-0 text-blue-400 transition-all duration-300 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
          size={24}
        />
      </div>
    </button>
  );
}
