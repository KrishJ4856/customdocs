'use server'
import { createMastra } from '@/mastra'
import { nanoid } from 'nanoid'
import { auth, currentUser } from '@clerk/nextjs/server'
import { upsertUser, createDoc, createPages, updatePageContent, getDocsByUserWithCount, saveUserKey, getUserKey, getDocBySlug } from '@/db/queries'
import { encrypt, decrypt } from '@/lib/encryption'

export async function generateDocs(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'User not authenticated' }

  const clerkUser = await currentUser()
  await upsertUser({
    id: userId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
    name: clerkUser?.fullName ?? null,
  })

  const query = formData.get('query') as string

  if (!query?.trim()) {
    return { success: false, error: 'Provide a topic to get started.' }
  }

  // File uploads disabled for v1
  // const rawFiles = formData.getAll('files') as File[]
  const files: never[] = []

  const encryptedKey = await getUserKey(userId)
  if (!encryptedKey) {
    return { success: false, error: 'No API key set. Add your DeepSeek key from the user menu (click your avatar → Key).' }
  }

  let apiKey: string
  try {
    apiKey = decrypt(encryptedKey)
  } catch {
    return { success: false, error: 'Failed to decrypt API key. Please re-enter it from the user menu.' }
  }

  try {
    const m = createMastra(apiKey)
    const workflow = m.getWorkflow('createDocsWorkflow')
    const run = await workflow.createRun()

    const result = await run.start({
      inputData: {
        query: query?.trim() ?? '',
        files,
      },
    })

    if (result.status !== 'success') {
      return {
        success: false,
        error: 'Workflow did not complete. Please try again.',
      }
    }

    const data = result.result

    const slug = `${data.docSlug}-${nanoid(5)}`
    const title = data.docTitle
    const brief = data.docBrief
    const firstPageSlug = data.sections[0]?.topics[0]?.slug ?? ''

    const doc = await createDoc({ userId, title, slug, brief, isPublic: false, fileUrls: [], firstPageSlug })

    const newPages = data.sections.flatMap((section, sectionIdx) =>
      section.topics.map((topic, pageIdx) => ({
        docId: String(doc._id),
        slug: topic.slug,
        title: topic.title,
        content: topic.content,
        sectionTitle: section.title,
        sectionOrder: sectionIdx,
        pageOrder: pageIdx,
        subtopics: topic.subtopics ?? [],
      }))
    )

    await createPages(newPages)

    return {
      success: true,
      slug,
      firstPageSlug,
    }
  } catch (err) {
    console.error('[generateDocs] error:', err)
    return { success: false, error: 'Failed to generate docs. Please try again.' }
  }
}

export async function savePage(pageId: string, content: string) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  try {
    await updatePageContent(pageId, userId, content)
    return { success: true }
  } catch (err) {
    console.error('[savePage] error:', err)
    return { success: false, error: 'Failed to save page. Please try again.' }
  }
}

export async function saveUserApiKey(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const key = formData.get('key') as string
  if (!key?.trim()) return { success: false, error: 'Key is required.' }

  try {
    const encryptedKey = encrypt(key.trim())
    await saveUserKey(userId, encryptedKey)
    return { success: true }
  } catch (err) {
    console.error('[saveUserApiKey] error:', err)
    return { success: false, error: 'Failed to save API key. Please try again.' }
  }
}

export async function checkUserKey() {
  const { userId } = await auth()
  if (!userId) return { hasKey: false }
  const key = await getUserKey(userId)
  return { hasKey: key !== null && key !== '' }
}

export async function deleteUserApiKey() {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }
  try {
    await saveUserKey(userId, '')
    return { success: true }
  } catch (err) {
    console.error('[deleteUserApiKey] error:', err)
    return { success: false, error: 'Failed to delete API key. Please try again.' }
  }
}

export async function getUserDocs() {
  const { userId } = await auth()
  if (!userId) return []

  const userDocs = await getDocsByUserWithCount(userId)

  return userDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    firstPageSlug: (doc as any).firstPageSlug ?? '',
    brief: (doc as any).brief ?? '',
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(doc.createdAt)),
    pageCount: doc.pageCount,
    isPublic: doc.isPublic,
  }))
}

export async function getDemoDoc() {
  const slug = process.env.DEMO_DOC_SLUG
  if (!slug) return null
  return getDocBySlug(slug)
}
