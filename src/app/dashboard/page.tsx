'use client'

import { useRef, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import {useRouter} from "next/navigation"
import { generateDocs } from '../server/doc-actions'

interface AttachedFile {
  id: string
  name: string
  type: string
}

interface Files{
  id: string,
  file: File
}

interface Documentation {
  id: string
  title: string
  description: string
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

// mock documents to be displayed as cards
// todo: here we fetch the user's docs from the db and display
/*
  table 1: user
  fields: userId, name, email, profile image, array of documents created in his account of type @Documentation interface[] where doc id can be a foreign key pointing to that specific doc in the docs table...
*/
const mockDocs: Documentation[] = [
  {
    id: '1',
    title: 'Java — OOP, Collections & I/O',
    description: 'Covers object-oriented principles, generics, collection framework, and file handling.',
    date: 'May 16, 2026',
    pageCount: 12,
    isPublic: true,
  },
  {
    id: '2',
    title: 'TypeScript Fundamentals',
    description: 'Types, interfaces, generics, utility types, and advanced patterns.',
    date: 'May 14, 2026',
    pageCount: 9,
    isPublic: false,
  },
  {
    id: '3',
    title: 'React Hooks Deep Dive',
    description: 'useState, useEffect, useRef, custom hooks, and performance patterns.',
    date: 'May 10, 2026',
    pageCount: 7,
    isPublic: false,
  },
]

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Files[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const firstName = user?.firstName ?? 'there'

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // const newFiles: AttachedFile[] = Array.from(files).map((f) => ({
    //   id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    //   name: f.name,
    //   type: f.type,
    // }))
    // setAttachedFiles((prev) => [...prev, ...newFiles])

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
    // TODO: wire up API
    // await new Promise((r) => setTimeout(r, 1200))
    const formData = new FormData()
    formData.append("query", query)
    if(uploadedFiles.length > 0){
      uploadedFiles.forEach((f) => {
        formData.append("files", f.file)
      })
    }

    const result = await generateDocs(formData)
    console.log(result)
    if(result.success){
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

      {/* ── Your docs ──────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Your docs
            <span className="ml-2 font-mono text-xs font-normal text-gray-400">
              {mockDocs.length}
            </span>
          </h2>
          <button className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Sort: Recent
          </button>
        </div>

        {mockDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No docs yet</p>
            <p className="mt-1 text-xs text-gray-400">Create your first doc above to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockDocs.map((doc) => (
              <button
                key={doc.id}
                className="group flex flex-col items-start rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                onClick={() => showToast('Opening docs viewer… (coming soon)')}
              >
                {/* Title row */}
                <div className="mb-3 flex w-full items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {doc.title}
                  </h3>
                  {doc.isPublic && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Public
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {doc.description}
                </p>

                {/* Meta */}
                <div className="mt-auto flex items-center gap-3 text-[10px] text-gray-400">
                  <span>{doc.date}</span>
                  <span>·</span>
                  <span>{doc.pageCount} pages</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}