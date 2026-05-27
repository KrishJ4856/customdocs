'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeKey = 'default' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'lavender' | 'midnight' | 'amber'

export interface DocTheme {
  key: ThemeKey
  name: string
  accent: string
  activeBg: string
  activeText: string
  darkActiveBg: string
  darkActiveText: string
  sectionColor: string
  blockquoteBorder: string
}

export const DOC_THEMES: DocTheme[] = [
  { key: 'default', name: 'Default', accent: '#6366f1', activeBg: '#eef2ff', activeText: '#4338ca', darkActiveBg: 'rgba(99,102,241,0.18)', darkActiveText: '#a5b4fc', sectionColor: '#9ca3af', blockquoteBorder: '#6366f1' },
  { key: 'ocean', name: 'Ocean', accent: '#0ea5e9', activeBg: '#e0f2fe', activeText: '#0369a1', darkActiveBg: 'rgba(14,165,233,0.18)', darkActiveText: '#7dd3fc', sectionColor: '#7dd3fc', blockquoteBorder: '#0ea5e9' },
  { key: 'forest', name: 'Forest', accent: '#22c55e', activeBg: '#dcfce7', activeText: '#15803d', darkActiveBg: 'rgba(34,197,94,0.18)', darkActiveText: '#86efac', sectionColor: '#86efac', blockquoteBorder: '#22c55e' },
  { key: 'sunset', name: 'Sunset', accent: '#f97316', activeBg: '#fff7ed', activeText: '#c2410c', darkActiveBg: 'rgba(249,115,22,0.18)', darkActiveText: '#fdba74', sectionColor: '#fdba74', blockquoteBorder: '#f97316' },
  { key: 'rose', name: 'Rose', accent: '#f43f5e', activeBg: '#fff1f2', activeText: '#be123c', darkActiveBg: 'rgba(244,63,94,0.18)', darkActiveText: '#fda4af', sectionColor: '#fda4af', blockquoteBorder: '#f43f5e' },
  { key: 'lavender', name: 'Lavender', accent: '#a855f7', activeBg: '#faf5ff', activeText: '#7e22ce', darkActiveBg: 'rgba(168,85,247,0.18)', darkActiveText: '#d8b4fe', sectionColor: '#d8b4fe', blockquoteBorder: '#a855f7' },
  { key: 'midnight', name: 'Midnight', accent: '#3b82f6', activeBg: '#eff6ff', activeText: '#1d4ed8', darkActiveBg: 'rgba(59,130,246,0.18)', darkActiveText: '#93c5fd', sectionColor: '#93c5fd', blockquoteBorder: '#3b82f6' },
  { key: 'amber', name: 'Amber', accent: '#f59e0b', activeBg: '#fffbeb', activeText: '#b45309', darkActiveBg: 'rgba(245,158,11,0.18)', darkActiveText: '#fcd34d', sectionColor: '#fcd34d', blockquoteBorder: '#f59e0b' },
]

export interface FontOption {
  name: string
  googleUrl: string | null
  family: string
}

export const PRESET_FONTS: FontOption[] = [
  { name: 'Geist', googleUrl: null, family: 'var(--font-geist-sans), system-ui, sans-serif' },
  { name: 'Inter', googleUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', family: 'Inter, system-ui, sans-serif' },
  { name: 'DM Sans', googleUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap', family: '"DM Sans", system-ui, sans-serif' },
  { name: 'Figtree', googleUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap', family: 'Figtree, system-ui, sans-serif' },
  { name: 'Plus Jakarta', googleUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap', family: '"Plus Jakarta Sans", system-ui, sans-serif' },
  { name: 'Public Sans', googleUrl: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap', family: '"Public Sans", system-ui, sans-serif' },
]

interface DocThemeContextValue {
  theme: DocTheme
  setTheme: (key: ThemeKey) => void
  font: FontOption
  setFont: (font: FontOption) => void
  applyCustomFont: (url: string) => void
}

const DocThemeContext = createContext<DocThemeContextValue | null>(null)

export function useDocTheme() {
  const ctx = useContext(DocThemeContext)
  if (!ctx) throw new Error('useDocTheme must be within DocThemeProvider')
  return ctx
}

function applyThemeToDom(theme: DocTheme, isDark: boolean) {
  const r = document.documentElement
  r.style.setProperty('--doc-accent', theme.accent)
  r.style.setProperty('--doc-active-bg', isDark ? theme.darkActiveBg : theme.activeBg)
  r.style.setProperty('--doc-active-text', isDark ? theme.darkActiveText : theme.activeText)
  r.style.setProperty('--doc-section-color', theme.sectionColor)
  r.style.setProperty('--doc-blockquote-border', theme.blockquoteBorder)
}

function injectGoogleFont(url: string, id: string) {
  if (document.getElementById(id)) return
  const link = Object.assign(document.createElement('link'), { id, rel: 'stylesheet', href: url })
  document.head.appendChild(link)
}

export function DocThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>('default')
  const [font, setFontState] = useState<FontOption>(PRESET_FONTS[0])

  const theme = DOC_THEMES.find((t) => t.key === themeKey) ?? DOC_THEMES[0]

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('doc-theme') as ThemeKey | null
      if (storedTheme && DOC_THEMES.find((t) => t.key === storedTheme)) setThemeKey(storedTheme)
      const storedFont = localStorage.getItem('doc-font')
      if (storedFont) {
        const f = JSON.parse(storedFont) as FontOption
        setFontState(f)
        if (f.googleUrl) injectGoogleFont(f.googleUrl, `gfont-${f.name}`)
        document.documentElement.style.setProperty('--doc-font', f.family)
      }
    } catch { }
  }, [])

  useEffect(() => {
    const apply = () => applyThemeToDom(theme, document.documentElement.classList.contains('dark'))
    apply()
    const obs = new MutationObserver(apply)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [theme])

  const setTheme = useCallback((key: ThemeKey) => {
    setThemeKey(key)
    localStorage.setItem('doc-theme', key)
  }, [])

  const setFont = useCallback((f: FontOption) => {
    setFontState(f)
    localStorage.setItem('doc-font', JSON.stringify(f))
    if (f.googleUrl) injectGoogleFont(f.googleUrl, `gfont-${f.name}`)
    document.documentElement.style.setProperty('--doc-font', f.family)
  }, [])

  const applyCustomFont = useCallback((url: string) => {
    const match = url.match(/family=([^:&]+)/)
    const raw = match ? decodeURIComponent(match[1]).replace(/\+/g, ' ') : 'Custom'
    const custom: FontOption = { name: raw, googleUrl: url, family: `"${raw}", system-ui, sans-serif` }
    setFont(custom)

    // Persist to custom fonts list
    const stored = JSON.parse(localStorage.getItem('doc-custom-fonts') ?? '[]') as FontOption[]
    if (!stored.find(f => f.name === custom.name)) {
      stored.push(custom)
      localStorage.setItem('doc-custom-fonts', JSON.stringify(stored))
    }
  }, [setFont])

  return (
    <DocThemeContext.Provider value={{ theme, setTheme, font, setFont, applyCustomFont }}>
      {children}
    </DocThemeContext.Provider>
  )
}