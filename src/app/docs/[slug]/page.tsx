import { redirect, notFound } from 'next/navigation'
import { getDocBySlug } from '@/db/queries'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DocIndexPage({ params }: Props) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)

  if (!doc || !doc.pages.length) notFound()

  redirect(`/docs/${slug}/${doc.firstPageSlug}`)
}
