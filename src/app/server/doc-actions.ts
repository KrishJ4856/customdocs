'use server'
import { mastra } from '@/mastra'
import {nanoid} from "nanoid"
import { auth, currentUser } from '@clerk/nextjs/server'
import { upsertUser, createDoc, createPages, updatePageContent } from '@/db/queries'

// console.log('DB URL exists:', !!process.env.DATABASE_URL)
// console.log('DB URL prefix:', process.env.DATABASE_URL?.slice(0, 30))

export async function generateDocs(formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'User not authenticated' }

  // Lazy user creation
  const clerkUser = await currentUser()
  await upsertUser({
    id: userId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
    name: clerkUser?.fullName ?? null,
  })

  const query = formData.get('query') as string
  const rawFiles = formData.getAll('files') as File[]

  // Validate we have something to work with
  if (!query?.trim() && rawFiles.length === 0) {
    return { success: false, error: 'Provide a topic or attach a file.' }
  }

  // TODO: replace with Uploadthing + file extraction when adding file support
  const files: never[] = []

  try {
    const workflow = mastra.getWorkflow('createDocsWorkflow')
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
        error: result.status === 'failed' ? result.error?.message : 'Workflow did not complete.',
      }
    }

    const data = result.result

    const slug = `${data.docSlug}-${nanoid(5)}`
    const title = data.docTitle
    const brief = data.docBrief

    // Save doc metadata
    const doc = await createDoc({ userId, title, slug, brief, isPublic: false, fileUrls: [] })

    // Flatten sections into pages and save them all
    const newPages = data.sections.flatMap((section, sectionIdx) =>
      section.topics.map((topic, pageIdx) => ({
        docId: doc.id,
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
      firstPageSlug: newPages[0]?.slug ?? ''
    }
  } catch (err) {
    console.error('[generateDocs] error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Called from the editor when user saves changes to a page
export async function savePage(pageId: string, content: string) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  try {
    await updatePageContent(pageId, userId, content)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Save failed' }
  }
}