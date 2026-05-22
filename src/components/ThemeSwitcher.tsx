'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
