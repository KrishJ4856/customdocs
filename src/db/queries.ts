import { eq, and, desc } from 'drizzle-orm'
import { db, users, docs, pages, withRetry } from './index'
import type { NewUser, NewDoc, NewPage } from './schema'
import { sql } from 'drizzle-orm'

// ── Users ──────────────────────────────────────────────────────────────────────

export async function upsertUser(data: NewUser) {
  await withRetry(() =>
    db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: { email: data.email, name: data.name },
      })
  )
}

// ── Docs ───────────────────────────────────────────────────────────────────────

export async function createDoc(data: NewDoc) {
  return withRetry(async () => {
    const [doc] = await db.insert(docs).values(data).returning()
    return doc
  })
}

export async function getDocBySlug(slug: string) {
  return withRetry(() =>
    db.query.docs.findFirst({
      where: eq(docs.slug, slug),
      with: { pages: { orderBy: (p, { asc }) => [asc(p.sectionOrder), asc(p.pageOrder)] } },
    })
  )
}

export async function getDocsByUser(userId: string) {
  return withRetry(() =>
    db.query.docs.findMany({
      where: eq(docs.userId, userId),
      orderBy: (d, { desc }) => [desc(d.createdAt)],
    })
  )
}

export async function getDocsByUserWithCount(userId: string) {
  return withRetry(() =>
    db
      .select({
        id: docs.id,
        title: docs.title,
        slug: docs.slug,
        brief: docs.brief,
        isPublic: docs.isPublic,
        createdAt: docs.createdAt,
        pageCount: sql<number>`cast(count(${pages.id}) as int)`,
      })
      .from(docs)
      .leftJoin(pages, eq(pages.docId, docs.id))
      .where(eq(docs.userId, userId))
      .groupBy(docs.id)
      .orderBy(desc(docs.createdAt))
  )
}

export async function updateDocVisibility(docId: string, userId: string, isPublic: boolean) {
  await withRetry(() =>
    db
      .update(docs)
      .set({ isPublic, updatedAt: new Date() })
      .where(and(eq(docs.id, docId), eq(docs.userId, userId)))
  )
}

export async function deleteDoc(docId: string, userId: string) {
  await withRetry(() =>
    db.delete(docs).where(and(eq(docs.id, docId), eq(docs.userId, userId)))
  )
}

// ── Pages ──────────────────────────────────────────────────────────────────────

export async function createPages(newPages: NewPage[]) {
  return withRetry(() => db.insert(pages).values(newPages).returning())
}

export async function getPageBySlug(docId: string, slug: string) {
  return withRetry(() =>
    db.query.pages.findFirst({
      where: and(eq(pages.docId, docId), eq(pages.slug, slug)),
    })
  )
}

export async function updatePageContent(pageId: string, userId: string, content: string) {
  await withRetry(async () => {
    const page = await db.query.pages.findFirst({
      where: eq(pages.id, pageId),
      with: { doc: true },
    })
    if (!page || page.doc.userId !== userId) throw new Error('Unauthorized')
    await db.update(pages).set({ content, updatedAt: new Date() }).where(eq(pages.id, pageId))
  })
}
