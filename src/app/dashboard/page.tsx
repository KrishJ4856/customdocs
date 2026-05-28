'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import { googleSansFlex, playwrite } from '../fonts'
import { generateDocs, getUserDocs } from '../server/doc-actions'
import { useKeyModal } from '@/context/KeyModalContext'

interface Files {
  id: string,
  file: File
}

interface DocCard {
  id: string
  title: string
  slug: string
  firstPageSlug: string
  brief: string
  date: string
  pageCount: number
  isPublic: boolean
}

// takes the file path and returns a logo for the file based on path extension
const fileTypeIcon = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return '📄'
    case 'doc': case 'docx': return '📝'
    case 'txt': return '📃'
    case 'md': return '📋'
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return '🖼️'
    default: return '📎'
  }
}

function DocCardItem({ doc, onClick }: { doc: DocCard; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300/80 hover:shadow-lg dark:border-gray-800/80 dark:bg-gray-950 dark:hover:border-gray-700/80 dark:hover:shadow-black/40 cursor-pointer"
    >
      {/* Top decorative area */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-(--doc-active-bg) via-white to-(--doc-active-bg) dark:from-(--doc-active-bg) dark:via-gray-950 dark:to-(--doc-active-bg)">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        {/* Vertical accent line with glow */}
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent dark:via-indigo-400/30" />
        <div className="absolute animate-pulse left-[16px] top-4 h-2 w-2 rounded-full shadow-[0_0_6px_rgba(99,102,241,0.4)] dark:shadow-[0_0_8px_rgba(99,102,241,0.3)] bg-(--doc-accent)" />

        {/* Decorative corner dots */}
        <div className="absolute right-5 top-5 grid grid-cols-4 gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-[3px] w-[3px] rounded-full bg-gray-300/80 dark:bg-gray-700/80
            group-hover:bg-(--doc-accent)" />
          ))}
        </div>

        {/* Document icon watermark */}
        <div className="absolute bottom-3 left-7 text-gray-300 dark:text-gray-800">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>

        {/* Public badge */}
        {doc.isPublic && (
          <div className="absolute right-4 bottom-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-600/10 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-400/20">
              <span className="h-1 w-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Public
            </span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 py-5">
        <h3 className="text-sm font-semibold leading-snug text-gray-900 transition-colors duration-200 dark:text-gray-100 dark:group-hover:text-(--doc-section-color)
        group-hover:text-(--doc-accent)">
          {doc.title}
        </h3>
        {doc.brief && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {doc.brief}
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-3 text-[11px] font-medium text-gray-400 dark:text-gray-500">
          <span className="inline-flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {doc.date}
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="inline-flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const { openKeyModal } = useKeyModal()
  const [query, setQuery] = useState('')
  // const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Files[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showGenToast, setShowGenToast] = useState(false)
  const [docs, setDocs] = useState<DocCard[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const firstName = user?.firstName?.toLowerCase() ?? 'there'

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Fetch user's docs
  useEffect(() => {
    if (!user?.id) return
    setLoadingDocs(true)
    getUserDocs()
      .then((docs) => {
        setDocs(docs)
        setLoadingDocs(false)
      })
      .catch(() => setLoadingDocs(false))
  }, [user?.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: Files[] = Array.from(files).map((f) => {
      return {
        id: crypto.randomUUID(),
        file: f
      }
    })
    setUploadedFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleGenerate = async () => {
    if (!query.trim()) {
      showToast('Add a topic to get started.')
      return
    }
    setIsGenerating(true)
    setShowGenToast(true)
    const formData = new FormData()
    formData.append("query", query)

    const result = await generateDocs(formData)
    setShowGenToast(false)
    setIsGenerating(false)
    if (result.success) {
      showToast("Docs created!")
      router.push(`/docs/${result.slug}/${result.firstPageSlug}`)
    } else {
      const msg = result.error ?? "Couldn't generate docs."
      showToast(msg)
      if (msg.includes('API key')) {
        setTimeout(() => openKeyModal(), 2800)
      }
    }
    setIsGenerating(false)
    // showToast('Generation coming soon — pipeline is being built.')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[90%] sm:w-auto sm:max-w-lg animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-gray-200/80 bg-white/95 px-5 py-3 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/95 dark:text-gray-200">
          {toast}
        </div>
      )}

      {showGenToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[90%] sm:w-auto sm:max-w-lg animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-xs sm:text-sm font-medium text-amber-800 shadow-lg backdrop-blur-sm dark:border-amber-800/60 dark:bg-amber-950/90 dark:text-amber-200 flex items-center gap-2 sm:gap-3">
          <svg className="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Docs generation may take some time depending on your request. Typically less than 5 minutes.</span>
          <button
            onClick={() => setShowGenToast(false)}
            className="ml-1 shrink-0 rounded-md p-0.5 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Greeting ───────────────────────────────────────── */}
      <div className="mb-12">
        <h1 className={`${playwrite.className} text-4xl font-bold text-gray-900 dark:text-gray-50`}>
          What should we learn, 
          <span className={`transition-colors text-(--doc-accent)`}> today?</span>
        </h1>
      </div>

      {/* ── Create panel ───────────────────────────────────── */}
      <section className="mb-14 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:border-(--doc-active-bg) dark:border-gray-800/80 dark:bg-gray-900 dark:focus-within:border-gray-700/80 dark:focus-within:shadow-black/20">

        {/* Attached files (disabled for v1) */}
        {/*
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-gray-100 px-5 pt-4 pb-3 dark:border-gray-800/80">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-1.5 text-xs backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/60"
              >
                <span className="text-gray-500 dark:text-gray-400">{fileTypeIcon(file.file.name)}</span>
                <span className="max-w-[160px] truncate font-medium text-gray-700 dark:text-gray-300">
                  {file.file.name}
                </span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-1 rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  aria-label={`Remove ${file.file.name}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        */}

        {/* Textarea */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Describe the docs you want... e.g. "Java OOP for BCA semester 3 exam" or "Deep dive into React hooks"'
          rows={4}
          className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400/80 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-600/80"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3.5 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            {/*
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.svg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attach file
            </button>
            */}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`${googleSansFlex.className} inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-bolder shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.97] disabled:opacity-50 cursor-pointer disabled:hover:bg-gray-950 disabled:active:scale-100  dark:hover:bg-(--doc) 
              transition-colors text-(--doc-accent) bg-(--doc-active-bg)`}
            >
              {isGenerating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  Generate docs
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Docs section ─────────────────────────────────────────────────── */}
      <section>
        {/* Header */}
        <div className={`${googleSansFlex.className} mb-8 flex items-end justify-between border-b border-gray-200/80 pb-4 dark:border-gray-800/80`}>
          <div>
            <h2 className="relative top-[5px] text-3xl font-bold tracking-wide text-gray-950 dark:text-gray-50">
              {firstName}
              <span className="ml-1.5 text-(--doc-accent)">[docs]</span>
            </h2>
            {/* {!loadingDocs && docs.length > 0 && (
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {docs.length} {docs.length === 1 ? 'documentation' : 'documentations'} created
              </p>
            )} */}
          </div>
          {!loadingDocs && docs.length > 0 && (
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {docs.length} total
            </span>
          )}
        </div>

        {/* States */}
        {loadingDocs ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="h-32 bg-gray-100 animate-pulse dark:bg-gray-800/50" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded-md bg-gray-100 animate-pulse dark:bg-gray-800/50" />
                  <div className="h-3 w-full rounded-md bg-gray-100 animate-pulse dark:bg-gray-800/50" />
                  <div className="h-3 w-2/3 rounded-md bg-gray-100 animate-pulse dark:bg-gray-800/50" />
                </div>
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 py-24 text-center dark:border-gray-800 dark:bg-gray-900/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No docs yet</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Generate your first documentation above and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {docs.map((doc) => (
              <DocCardItem
                key={doc.id}
                doc={doc}
                onClick={() => router.push(`/docs/${doc.slug}/${doc.firstPageSlug}`)}
              />
            ))}
          </div>
        )}
      </section>

    </main>
  )
}