'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { getDemoDoc } from '@/app/server/doc-actions'
import { mdComponents } from '@/components/docs/DocViewer'

interface DemoPage {
  id: string
  docId: string
  slug: string
  title: string
  content: string
  sectionTitle: string
  sectionOrder: number
  pageOrder: number
  subtopics: { slug: string; title: string; contentOverview: string }[]
}

interface DemoDoc {
  id: string
  title: string
  slug: string
  firstPageSlug: string
  pages: DemoPage[]
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export default function DemoSection() {
  const [doc, setDoc] = useState<DemoDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSlug, setActiveSlug] = useState<string>('')
  const [activeHeading, setActiveHeading] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getDemoDoc().then((data) => {
      if (data) {
        setDoc(data)
        setActiveSlug(data.firstPageSlug)
      }
      setLoading(false)
    })
  }, [])

  const activePage = doc?.pages.find((p) => p.slug === activeSlug) ?? doc?.pages[0]

  const sections = doc
    ? doc.pages.reduce<{ title: string; topics: DemoPage[] }[]>((acc, page) => {
        const existing = acc.find((s) => s.title === page.sectionTitle)
        if (existing) {
          existing.topics.push(page)
        } else {
          acc.push({ title: page.sectionTitle, topics: [page] })
        }
        return acc
      }, [])
    : []

  const headings = (activePage?.content.match(/^##\s+(.+)$/gm) ?? []).map((h) =>
    h.replace(/^##\s+/, '')
  )

  useEffect(() => {
    const el = contentRef.current
    if (!el || !activePage) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHeading(entry.target.id)
        }
      },
      { root: el, rootMargin: '-20% 0px -70% 0px' }
    )
    const headingEls = el.querySelectorAll('h2, h3')
    headingEls.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [activeSlug])

  const scrollTo = useCallback((heading: string) => {
    const el = contentRef.current
    const target = el?.querySelector(`#${CSS.escape(slugify(heading))}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const switchPage = useCallback((slug: string) => {
    setActiveSlug(slug)
    setMobileNavOpen(false)
    setTimeout(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }, [])

  const allPages = doc?.pages ?? []
  const activeIndex = allPages.findIndex((p) => p.slug === activeSlug)
  const prevPage = activeIndex > 0 ? allPages[activeIndex - 1] : null
  const nextPage = activeIndex < allPages.length - 1 ? allPages[activeIndex + 1] : null

  if (loading) {
    return (
      <section className="flex items-center justify-center py-28">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading demo...</span>
        </div>
      </section>
    )
  }

  if (!doc) {
    return (
      <section className="flex items-center justify-center py-28">
        <span className="text-sm text-gray-400 dark:text-gray-600">Demo didn't load here? Please shoot me a DM on Twitter: <a href="https://www.x.com/Krish4856" target="_blank" rel="noopener noreferrer" className='transition-colors text-(--doc-accent) underline'>@Krish4856</a>, I'll fix it asap</span>
      </section>
    )
  }

  return (
    <section className="mx-auto w-[80%] max-w-6xl">
      <div className="my-12 overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm relative">
        <div className="flex h-[75vh] w-full overflow-hidden">

          {/* Left Sidebar */}
          <aside className="hidden w-60 shrink-0 border-r border-gray-100 dark:border-gray-800 lg:block">
            <div className="h-full overflow-y-auto px-3 py-6">
              <p className="mb-4 px-2 text-[13px] font-semibold uppercase tracking-widest text-(--doc-accent)">
                {doc.title}
              </p>
              <nav className="space-y-5 relative top-[10px]">
                {sections.map((section) => (
                  <div key={section.title}>
                    <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      {section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.topics.map((topic) => {
                        const isActive = topic.slug === activeSlug
                        return (
                          <li key={topic.slug}>
                            <button
                              onClick={() => switchPage(topic.slug)}
                              className="block w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer"
                              style={isActive ? {
                                backgroundColor: 'var(--doc-accent)',
                                color: 'white',
                                fontWeight: 500,
                              } : {}}
                            >
                              <span className={!isActive ? 'text-gray-600 dark:text-gray-400 hover:text-(--doc-active-text)' : ''}>
                                {topic.title}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Center Content */}
          <main className="min-w-0 flex-1 overflow-y-auto px-4 pt-8 sm:px-8 xl:px-16 scroll-smooth" ref={contentRef}>
            <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-(--doc-section-color)">
                {activePage?.sectionTitle}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50 sm:text-3xl">
                {activePage?.title}
              </h1>
            </div>

            <div className="max-w-3xl pb-32 lg:pb-10">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
                components={mdComponents as never}
              >
                {activePage?.content ?? ''}
              </ReactMarkdown>

              {(prevPage || nextPage) && (
                <div className="mt-16 hidden items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800 lg:flex">
                  {prevPage ? (
                    <button onClick={() => switchPage(prevPage.slug)} className="group flex flex-col gap-0.5 cursor-pointer">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">Previous</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-hover:text-(--doc-accent) dark:group-hover:text-(--doc-section-color)">← {prevPage.title}</span>
                    </button>
                  ) : <div />}
                  {nextPage && (
                    <button onClick={() => switchPage(nextPage.slug)} className="group flex flex-col items-end gap-0.5 cursor-pointer">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">Next</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-(--doc-accent) dark:text-gray-300 dark:group-hover:text-(--doc-section-color)">{nextPage.title} →</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Right TOC */}
          <aside className="hidden w-52 shrink-0 xl:block">
            <div className="h-full overflow-y-auto px-4 py-6">
              {headings.length > 0 && (
                <>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    On this page
                  </p>
                  <nav className="space-y-0.5">
                    {headings.map((heading) => {
                      const id = slugify(heading)
                      return (
                        <button
                          key={heading}
                          onClick={() => scrollTo(heading)}
                          className="cursor-pointer block w-full text-left rounded px-2 py-1 text-[13px] transition-colors text-gray-500 hover:text-(--doc-accent) dark:text-gray-500 dark:hover:text-(--doc-active-text)"
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

        {/* Mobile Bottom Nav — overlaid at bottom of frame */}
        <div className="absolute bottom-0 left-0 right-0 lg:hidden">
          {mobileNavOpen && (
            <div className="absolute bottom-full left-0 right-0 max-h-[50vh] overflow-y-auto border-t border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-950">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                {doc.title}
              </p>
              <nav className="space-y-5">
                {sections.map((section) => (
                  <div key={section.title}>
                    <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      {section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.topics.map((topic) => {
                        const isActive = topic.slug === activeSlug
                        return (
                          <li key={topic.slug}>
                            <button
                              onClick={() => switchPage(topic.slug)}
                              className="block w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer"
                              style={isActive ? {
                                backgroundColor: 'var(--doc-accent)',
                                color: 'white',
                                fontWeight: 500,
                              } : {}}
                            >
                              <span className={!isActive ? 'text-gray-600 dark:text-gray-400 hover:text-(--doc-active-text)' : ''}>
                                {topic.title}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            {prevPage ? (
              <button onClick={() => switchPage(prevPage.slug)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-(--doc-accent) dark:hover:text-(--doc-section-color) cursor-pointer">
                <span>←</span>
                <span className="max-w-[100px] truncate">{prevPage.title}</span>
              </button>
            ) : <div />}

            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-(--doc-accent) dark:bg-(--doc-active-bg) dark:text-gray-300 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6l-12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              {mobileNavOpen ? 'Close' : 'Contents'}
            </button>

            {nextPage ? (
              <button onClick={() => switchPage(nextPage.slug)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-(--doc-accent) dark:hover:text-(--doc-section-color) cursor-pointer">
                <span className="max-w-[100px] truncate">{nextPage.title}</span>
                <span>→</span>
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </section>
  )
}
