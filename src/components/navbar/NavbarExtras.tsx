'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDocTheme, DOC_THEMES, PRESET_FONTS } from '@/context/DocThemeContext'
import type { ThemeKey, FontOption } from '@/context/DocThemeContext'

export default function NavbarExtras() {
  const { theme, setTheme, font, setFont, applyCustomFont } = useDocTheme()
  const [showPicker, setShowPicker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [customFonts, setCustomFonts] = useState<FontOption[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  // Close picker on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Focus search on open
  useEffect(() => { if (showSearch) searchRef.current?.focus() }, [showSearch])

  // Escape closes everything
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowSearch(false); setShowPicker(false) }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('doc-custom-fonts') ?? '[]')
      setCustomFonts(Array.isArray(stored) ? stored : [])
    } catch { }
  }, [showPicker])

  const allFonts = [...PRESET_FONTS, ...customFonts]

  return (
    <div className="flex items-center gap-1">

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {toast}
        </div>
      )}

      {/* ── Search (disabled) ── */}
      {/*
      {showSearch ? (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800">
          <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs..."
            className="w-36 bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100"
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
          aria-label="Search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}
      */}

      {/* ── GitHub (disabled) ── */}
      {/*
      <button
        onClick={() => showToast('GitHub integration coming soon!')}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
        aria-label="GitHub"
      >
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </button>
      */}

      {/* ── Theme + Font picker ── */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          aria-label="Customize theme and font"
        >
          <span
            className="h-[18px] w-[18px] rounded-full border-2 border-white shadow-sm dark:border-gray-900"
            style={{ backgroundColor: theme.accent }}
          />
        </button>

        {showPicker && (
          <div className="absolute right-[65px] translate-x-1/2 sm:right-0 sm:translate-x-0 top-10 z-[60] w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-950">

            {/* Theme grid */}
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Theme</p>
            <div className="grid grid-cols-4 gap-2 mb-1">
              {DOC_THEMES.map((t) => {
                const isActive = theme.key === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key as ThemeKey)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  >
                    <span
                      className="h-7 w-7 rounded-full shadow-sm transition-transform"
                      style={{
                        backgroundColor: t.accent,
                        outline: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
                        outlineOffset: '2px',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">{t.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="my-3.5 border-t border-gray-100 dark:border-gray-800" />

            {/* Font grid */}
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Font</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {
                allFonts.map((f) => {
                  const isActive = font.name === f.name
                  return (
                    <button
                      key={f.name}
                      onClick={() => setFont(f as FontOption)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition-all cursor-pointer ${isActive
                        ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-900'
                        : 'border-gray-100 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                        }`}
                    >
                      <span
                        className="text-[15px] font-semibold text-gray-900 dark:text-gray-100"
                        style={{ fontFamily: f.family }}
                      >
                        Ag
                      </span>
                      <span className="text-[9px] text-gray-500 dark:text-gray-400">{f.name}</span>
                    </button>
                  )
                })}
            </div>

            {/* Custom Google Font URL */}
            <div className="flex items-center gap-1.5">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customUrl.trim()) {
                    applyCustomFont(customUrl.trim())
                    setCustomUrl('')
                  }
                }}
                placeholder="Paste Google Fonts URL..."
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder-gray-600"
              />
              <button
                onClick={() => { if (customUrl.trim()) { applyCustomFont(customUrl.trim()); setCustomUrl('') } }}
                className="shrink-0 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-gray-900 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}