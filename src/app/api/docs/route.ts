import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDocsByUserWithCount } from '@/db/queries'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userDocs = await getDocsByUserWithCount(userId)

  // Shape for the dashboard card
  const docs = userDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    brief: (doc as any).brief ?? '',
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(doc.createdAt)),
    pageCount: doc.pageCount,
    isPublic: doc.isPublic,
  }))

  return NextResponse.json({ docs })
}