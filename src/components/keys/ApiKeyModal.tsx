'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { saveUserApiKey, checkUserKey, deleteUserApiKey } from '@/app/server/doc-actions'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ApiKeyModal({ open, onClose }: Props) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  useEffect(() => {
    if (open) {
      setMounted(false)
      setKey('')
      setShowKey(false)
      setSaving(false)
      setHasExistingKey(false)
      setChecking(true)

      requestAnimationFrame(() => {
        setMounted(true)
      })

      const timer = setTimeout(() => inputRef.current?.focus(), 350)

      checkUserKey().then((res) => {
        setHasExistingKey(res.hasKey)
        setChecking(false)
      })

      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  const handleSave = async () => {
    if (!key.trim()) { showToast('Please enter your API key.'); return }
    setSaving(true)
    try {
      const form = new FormData()
      form.append('key', key.trim())
      const res = await saveUserApiKey(form)
      if (res.success) {
        showToast('API key saved.')
        setTimeout(onClose, 800)
      } else {
        showToast(res.error ?? 'Failed to save key.')
      }
    } catch {
      showToast('Failed to save API key. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!window.confirm('Delete your API key from your account?')) return
    onClose()
    deleteUserApiKey().then((res) => {
      if (res.success) showToast('API key deleted.')
    }).catch(() => {
      showToast('Failed to delete API key.')
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {toast && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {toast}
        </div>
      )}

      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-950 ${
          mounted ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
        }`}
      >
        {checking ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
          </div>
        ) : hasExistingKey ? (
          <>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Your DeepSeek API Key:</p>

            <div className="relative mb-5">
              <input
                type="password"
                value="••••••••••••••••••••"
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500"
              />
              <button
                type="button"
                onClick={handleDelete}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                aria-label="Delete API key"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Your DeepSeek API Key:</p>

            <div className="relative mb-5">
              <input
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-600 dark:focus:ring-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-3 3m0 0l6.364-6.364M9.879 9.879L3.515 3.515" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-gray-950 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-gray-950 cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
