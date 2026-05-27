import { cache } from 'react'
import { connectDB, User, Doc, Page, withRetry } from './index'
import type { NewUser, NewDoc, NewPage, Page as PageType, Doc as DocType } from './models'

async function ensureConnection() {
  await connectDB()
}

export async function upsertUser(data: NewUser) {
  await ensureConnection()
  return withRetry(() =>
    User.findOneAndUpdate(
      { _id: data.id },
      { $setOnInsert: { createdAt: new Date() }, $set: { email: data.email, name: data.name } },
      { upsert: true, returnDocument: 'after' }
    )
  )
}

export async function createDoc(data: NewDoc) {
  await ensureConnection()
  return withRetry(async () => {
    const doc = await Doc.create(data)
    return doc.toObject()
  })
}

export const getDocBySlug = cache(async (slug: string) => {
  await ensureConnection()
  return withRetry(async () => {
    const doc = await Doc.findOne({ slug }).lean()
    if (!doc) return null

    const pages = await Page.find({ docId: doc._id })
      .sort({ sectionOrder: 1, pageOrder: 1 })
      .lean()

    return {
      id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      slug: doc.slug,
      firstPageSlug: doc.firstPageSlug,
      isPublic: doc.isPublic,
      fileUrls: doc.fileUrls ?? [],
      brief: doc.brief ?? null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
      pages: pages.map(p => ({
        id: p._id.toString(),
        docId: p.docId.toString(),
        slug: p.slug,
        title: p.title,
        content: p.content,
        sectionTitle: p.sectionTitle,
        sectionOrder: p.sectionOrder,
        pageOrder: p.pageOrder,
        subtopics: p.subtopics ?? [],
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
      })),
    }
  })
})

export async function getDocsByUser(userId: string) {
  await ensureConnection()
  return withRetry(() =>
    Doc.find({ userId }).sort({ createdAt: -1 }).lean().then(docs =>
      docs.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        title: d.title,
        slug: d.slug,
        firstPageSlug: d.firstPageSlug,
        isPublic: d.isPublic,
        fileUrls: d.fileUrls ?? [],
        brief: d.brief ?? null,
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
      }))
    )
  )
}

export async function getDocsByUserWithCount(userId: string) {
  await ensureConnection()
  return withRetry(() =>
    Doc.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'pages',
          localField: '_id',
          foreignField: 'docId',
          as: 'pages',
        },
      },
      { $addFields: { pageCount: { $size: '$pages' } } },
      { $project: { pages: 0 } },
      { $sort: { createdAt: -1 } },
    ]).then(docs =>
      docs.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        title: d.title,
        slug: d.slug,
        firstPageSlug: d.firstPageSlug,
        isPublic: d.isPublic,
        fileUrls: d.fileUrls ?? [],
        brief: d.brief ?? null,
        pageCount: d.pageCount,
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
      }))
    )
  )
}

export async function updateDocVisibility(docId: string, userId: string, isPublic: boolean) {
  await ensureConnection()
  return withRetry(() =>
    Doc.updateOne(
      { _id: docId, userId },
      { $set: { isPublic, updatedAt: new Date() } }
    )
  )
}

export async function deleteDoc(docId: string, userId: string) {
  await ensureConnection()
  return withRetry(async () => {
    const result = await Doc.deleteOne({ _id: docId, userId })
    if (result.deletedCount > 0) {
      await Page.deleteMany({ docId })
    }
  })
}

export async function createPages(newPages: NewPage[]) {
  await ensureConnection()
  return withRetry(async () => {
    const created = await Page.insertMany(newPages)
    return created.map(p => p.toObject())
  })
}

export async function getPageBySlug(docId: string, slug: string) {
  await ensureConnection()
  return withRetry(async () => {
    const page = await Page.findOne({ docId, slug }).lean()
    if (!page) return null
    return {
      id: page._id.toString(),
      docId: page.docId.toString(),
      slug: page.slug,
      title: page.title,
      content: page.content,
      sectionTitle: page.sectionTitle,
      sectionOrder: page.sectionOrder,
      pageOrder: page.pageOrder,
      subtopics: page.subtopics ?? [],
      createdAt: page.createdAt instanceof Date ? page.createdAt.toISOString() : page.createdAt,
      updatedAt: page.updatedAt instanceof Date ? page.updatedAt.toISOString() : page.updatedAt,
    }
  })
}

export async function updatePageContent(pageId: string, userId: string, content: string) {
  await ensureConnection()
  return withRetry(async () => {
    const page = await Page.findById(pageId).lean()
    if (!page) throw new Error('Page not found')

    const doc = await Doc.findById(page.docId).lean()
    if (!doc || doc.userId !== userId) throw new Error('Unauthorized')

    await Page.updateOne(
      { _id: pageId },
      { $set: { content, updatedAt: new Date() } }
    )
  })
}

export async function saveUserKey(userId: string, encryptedKey: string) {
  await ensureConnection()
  return withRetry(() =>
    User.updateOne({ _id: userId }, { $set: { encryptedKey } })
  )
}

export async function getUserKey(userId: string) {
  await ensureConnection()
  return withRetry(async () => {
    const user = await User.findById(userId).select('encryptedKey').lean()
    return user?.encryptedKey ?? null
  })
}
