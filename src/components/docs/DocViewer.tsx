'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import type { StoredDoc, Topic } from '@/lib/doc-store'
import { useEffect, useRef, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  doc: StoredDoc
  activeTopic: Topic
  activeSection: string
}

// ── Heading slug helper ────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ── Custom markdown components ─────────────────────────────────────────────────

const mdComponents = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(String(children))
    return (
      <h2
        id={id}
        className="group relative mt-12 mb-4 scroll-mt-24 text-xl font-semibold text-gray-900 dark:text-gray-50"
        {...props}
      >
        <a
          href={`#${id}`}
          className="absolute -left-5 top-0 hidden text-gray-300 group-hover:inline dark:text-gray-600"
          aria-hidden
        >
          #
        </a>
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(String(children))
    return (
      <h3
        id={id}
        className="mt-8 mb-3 scroll-mt-24 text-base font-semibold text-gray-800 dark:text-gray-100"
        {...props}
      >
        {children}
      </h3>
    )
  },
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-7 text-gray-600 dark:text-gray-400" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 ml-4 space-y-1.5 list-disc marker:text-gray-400" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 ml-4 space-y-1.5 list-decimal marker:text-gray-400" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7 text-gray-600 dark:text-gray-400 pl-1" {...props}>
      {children}
    </li>
  ),
  code: ({ inline, children, className, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    if (inline) {
      return (
        <code
          className="rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-gray-800 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className={`font-mono text-sm ${className ?? ''}`} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="my-5 overflow-x-auto rounded-xl border border-gray-200 bg-gray-950 px-5 py-4 text-sm dark:border-gray-800"
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-4 border-l-4 border-indigo-400 pl-4 italic text-gray-500 dark:border-indigo-600 dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </strong>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      {...props}
    >
      {children}
    </a>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="border-b border-gray-100 px-4 py-2.5 text-gray-600 dark:border-gray-800/60 dark:text-gray-400"
      {...props}
    >
      {children}
    </td>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-gray-200 dark:border-gray-800" {...props} />
  ),
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DocViewer({ doc, activeTopic, activeSection }: Props) {
  const params = useParams()
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeHeading, setActiveHeading] = useState<string>('')

  // Extract ## headings from markdown for the right TOC
  const headings = (activeTopic.content.match(/^##\s+(.+)$/gm) ?? []).map((h) =>
    h.replace(/^##\s+/, '')
  )

  // Intersection observer — highlight active TOC item while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    const headingEls = contentRef.current?.querySelectorAll('h2, h3') ?? []
    headingEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [activeTopic.slug])

  const scrollTo = (heading: string) => {
    const id = slugify(heading)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full">

      {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 border-r border-gray-100 dark:border-gray-800 lg:block">
        <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto px-3 py-6">

          {/* Doc title */}
          <p className="mb-4 px-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {doc.title}
          </p>

          <nav className="space-y-5">
            {doc.sections.map((section) => (
              <div key={section.title}>
                {/* Section label */}
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>

                {/* Topics */}
                <ul className="space-y-0.5">
                  {section.topics.map((topic) => {
                    const isActive = topic.slug === activeTopic.slug
                    return (
                      <li key={topic.slug}>
                        <Link
                          href={`/docs/${params.slug}/${topic.slug}`}
                          className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200'
                          }`}
                        >
                          {topic.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 px-8 py-10 xl:px-16" ref={contentRef}>
        {/* Page header */}
        <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-indigo-500">
            {activeSection}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
            {activeTopic.title}
          </h1>
        </div>

        {/* Markdown */}
        <div className="max-w-3xl">
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            components={mdComponents as never}
          >
            {activeTopic.content}
          </ReactMarkdown>
        </div>

        {/* Prev / Next navigation */}
        <PrevNext doc={doc} activeSlug={activeTopic.slug} docSlug={String(params.slug)} />
      </main>

      {/* ── Right TOC ─────────────────────────────────────────────────────── */}
      <aside className="hidden w-52 shrink-0 xl:block">
        <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto px-4 py-6">
          {headings.length > 0 && (
            <>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                On this page
              </p>
              <nav className="space-y-0.5">
                {headings.map((heading) => {
                  const id = slugify(heading)
                  const isActive = activeHeading === id
                  return (
                    <button
                      key={heading}
                      onClick={() => scrollTo(heading)}
                      className={`block w-full text-left rounded px-2 py-1 text-xs transition-colors ${
                        isActive
                          ? 'font-medium text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300'
                      }`}
                    >
                      {heading}
                    </button>
                  )
                })}
              </nav>
            </>
          )}
        </div>
      </aside>

    </div>
  )
}

// ── Prev/Next ──────────────────────────────────────────────────────────────────

function PrevNext({
  doc,
  activeSlug,
  docSlug,
}: {
  doc: StoredDoc
  activeSlug: string
  docSlug: string
}) {
  const allTopics = doc.sections.flatMap((s) => s.topics)
  const idx = allTopics.findIndex((t) => t.slug === activeSlug)
  const prev = idx > 0 ? allTopics[idx - 1] : null
  const next = idx < allTopics.length - 1 ? allTopics[idx + 1] : null

  if (!prev && !next) return null

  return (
    <div className="mt-16 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800">
      {prev ? (
        <Link
          href={`/docs/${docSlug}/${prev.slug}`}
          className="group flex flex-col gap-0.5"
        >
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Previous</span>
          <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400">
            ← {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          href={`/docs/${docSlug}/${next.slug}`}
          className="group flex flex-col items-end gap-0.5"
        >
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Next</span>
          <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400">
            {next.title} →
          </span>
        </Link>
      )}
    </div>
  )
}