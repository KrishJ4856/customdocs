import { redirect, notFound } from 'next/navigation'
import { getDoc, getFirstTopic } from '@/lib/doc-store'

interface Props {
  params: { slug: string }
}

export default function DocIndexPage({ params }: Props) {
  const doc = getDoc(params.slug)
  if (!doc) notFound()

  const first = getFirstTopic(doc)
  if (!first) notFound()

  redirect(`/docs/${params.slug}/${first.slug}`)
}