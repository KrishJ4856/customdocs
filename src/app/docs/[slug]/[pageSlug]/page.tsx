import { notFound } from 'next/navigation'
import { getDocBySlug } from '@/db/queries'
import DocViewer from '@/components/docs/DocViewer'
import type { DocForViewer } from '@/components/docs/DocViewer'

interface Props {
  params: Promise<{ slug: string; pageSlug: string }>
}

export default async function DocPage({ params }: Props) {
  const { slug, pageSlug } = await params

  const doc = await getDocBySlug(slug)
  if (!doc || !doc.pages.length) notFound()

  const activePage = doc.pages.find((p) => p.slug === pageSlug) ?? doc.pages[0]
  if (!activePage) notFound()

  // Reconstruct sidebar sections from flat pages
  const sections = doc.pages.reduce<{ title: string; topics: typeof doc.pages }[]>(
    (acc, page) => {
      const existing = acc.find((s) => s.title === page.sectionTitle)
      if (existing) {
        existing.topics.push(page)
      } else {
        acc.push({ title: page.sectionTitle, topics: [page] })
      }
      return acc
    },
    []
  )

  const docForViewer: DocForViewer = {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    userId: doc.userId,
    sections,
  }

  return (
    <DocViewer
      doc={docForViewer}
      activePage={activePage}
      activeSection={activePage.sectionTitle}
    />
  )
}