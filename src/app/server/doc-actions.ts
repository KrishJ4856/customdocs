'use server'

import { z } from 'zod'
import { mastra } from '@/mastra'
import { saveDoc } from "@/lib/doc-store"

// ─── Helper: convert a File to base64 ────────────────────────────────────────

// async function fileToBase64(file: File): Promise<string> {
//   const buffer = await file.arrayBuffer()
//   const bytes = new Uint8Array(buffer)
//   let binary = ''
//   for (const byte of bytes) {
//     binary += String.fromCharCode(byte)
//   }
//   return btoa(binary)
// }

// ─── Server Action ────────────────────────────────────────────────────────────

export async function generateDocs(formData: FormData) {
  const query = formData.get('query') as string
  const rawFiles = formData.getAll('files') as File[]

  // Validate we have something to work with
  if (!query?.trim() && rawFiles.length === 0) {
    return { success: false, error: 'Provide a topic or attach a file.' }
  }

  // Convert uploaded files to base64 so the agent can process them
  // const files = await Promise.all(
  //   rawFiles
  //     .filter((f) => f.size > 0) // ignore empty file inputs
  //     .map(async (f) => ({
  //       name: f.name,
  //       mimeType: f.type || 'application/octet-stream',
  //       base64: await fileToBase64(f),
  //     }))
  // )

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

    // console.log(result)

    if (result.status !== 'success') {
      return {
        success: false,
        error: result.status === 'failed' ? result.error?.message : 'Workflow did not complete.',
      }
    }

    const data = result.result

    // Building a slug from the query
    const slug =
      query
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60) +
      '-' +
      Date.now().toString(36)

    // Derive a title from the first section or query
    const title = data.sections?.[0]?.title ?? query.trim()

    // Save to store
    saveDoc({ slug, title, sections: data.sections, createdAt: new Date().toISOString() })
 
    // Return slug + first page info so frontend can redirect
    const firstTopic = data.sections?.[0]?.topics?.[0]
    return {
      success: true,
      slug,
      firstPageSlug: firstTopic?.slug ?? '',
    }
  } catch (err) {
    console.error('[generateDocs] error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}