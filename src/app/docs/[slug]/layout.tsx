import { notFound } from 'next/navigation'
import { getDocBySlug } from '@/db/queries'
import { DocProvider } from '@/context/DocContext'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function DocLayout({ children, params }: Props) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)

  if (!doc || !doc.pages.length) notFound()

  return <DocProvider doc={doc}>{children}</DocProvider>
}
