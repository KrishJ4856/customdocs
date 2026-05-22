import { notFound } from 'next/navigation'
import { getDoc } from '@/lib/doc-store'
import DocViewer from '@/components/docs/DocViewer'

interface Props {
  params: { slug: string; pageSlug: string }
}

export default function DocPage({ params }: Props) {
  const doc = getDoc(params.slug)
  if (!doc) notFound()

  // Find the requested topic across all sections
  const allTopics = doc.sections.flatMap((s) => s.topics)
  const topic = allTopics.find((t) => t.slug === params.pageSlug) ?? allTopics[0]
  if (!topic) notFound()

  return (
    <DocViewer
      doc={doc}
      activeTopic={topic}
      activeSection={
        doc.sections.find((s) => s.topics.some((t) => t.slug === topic.slug))?.title ?? ''
      }
    />
  )
}