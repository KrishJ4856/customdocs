'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { generateDocs } from '../server/doc-actions'
import { getDocsByUser } from '@/db/queries'

// interface AttachedFile {
//   id: string
//   name: string
//   type: string
// }

interface Files {
  id: string,
  file: File
}

interface DocCard {
  id: string
  title: string
  slug: string
  brief: string
  date: string
  pageCount: number
  isPublic: boolean
}

// interface Documentation {
//   id: string
//   title: string
//   description: string
//   date: string
//   pageCount: number
//   isPublic: boolean
// }

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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
    >
      {/* Top decorative area */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Vertical accent line */}
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-400/60 to-transparent dark:via-indigo-500/40" />
        {/* Dot accent at top of line */}
        <div className="absolute left-[18px] top-4 h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" />
        {/* Dot grid top-right */}
        <div className="absolute right-5 top-4 grid grid-cols-4 gap-[5px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-[3px] w-[3px] rounded-full bg-gray-300 dark:bg-gray-700" />
          ))}
        </div>
        {/* Public badge */}
        {doc.isPublic && (
          <div className="absolute right-4 bottom-3">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              Public
            </span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {doc.title}
        </h3>
        {doc.brief && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {doc.brief}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2.5 pt-2 text-[10px] text-gray-400">
          <span>{doc.date}</span>
          <span>·</span>
          <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
        </div>
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [query, setQuery] = useState('')
  // const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Files[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
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
    fetch(`/api/docs`)
      .then((r) => r.json())
      .then((data) => {
        setDocs(data.docs ?? [])
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
    if (!query.trim() && uploadedFiles.length === 0) {
      showToast('Add a topic or attach a file to get started.')
      return
    }
    setIsGenerating(true)
    const formData = new FormData()
    formData.append("query", query)
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((f) => {
        formData.append("files", f.file)
      })
    }

    const result = await generateDocs(formData)
    console.log(result)
    if (result.success) {
      showToast("Server returned a success message - docs created!")
      console.log(`routing to: /docs/${result.slug}/${result.firstPageSlug}`)
      router.push(`/docs/${result.slug}/${result.firstPageSlug}`)
    } else {
      showToast("Some error occurred, couldn't generate docs...")
      console.log("Error: ", result.error)
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {toast}
        </div>
      )}

      {/* ── Greeting ───────────────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Hey, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          What do you want to learn today?
        </p>
      </div>

      {/* ── Create panel ───────────────────────────────────── */}
      <section className="mb-12 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

        {/* Attached files */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 pt-4 pb-3 dark:border-gray-800">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs dark:border-gray-800 dark:bg-gray-800/60"
              >
                <span>{fileTypeIcon(file.file.name)}</span>
                <span className="max-w-[140px] truncate text-gray-700 dark:text-gray-300">
                  {file.file.name}
                </span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={`Remove ${file.file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Describe the docs you want... e.g. "Java OOP for BCA semester 3 exam" or "Deep dive into React hooks"'
          rows={4}
          className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder-gray-600"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
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
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attach file
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] text-gray-400 sm:block">
              ⌘ + Enter to generate
            </span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-gray-950"
            >
              {isGenerating ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating…
                </>
              ) : (
                'Generate docs'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Docs section ─────────────────────────────────────────────────── */}
      <section>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
            {firstName}{' '}
            <span className="text-indigo-400 dark:text-indigo-400">[docs]</span>
          </h1>
          {!loadingDocs && docs.length > 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {docs.length} {docs.length === 1 ? 'documentation' : 'documentations'} created
            </p>
          )}
        </div>

        {/* States */}
        {loadingDocs ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-gray-800">
            <div className="mb-3 text-2xl">📄</div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No docs yet</p>
            <p className="mt-1 text-xs text-gray-400">Generate your first documentation above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {docs.map((doc) => (
              <DocCardItem
                key={doc.id}
                doc={doc}
                onClick={() => router.push(`/docs/${doc.slug}`)}
              />
            ))}
          </div>
        )}
      </section>

    </main>
  )
}