import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { jsonrepair } from 'jsonrepair'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const attachedFileSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  dataUri: z.string().optional(),
  extractedText: z.string().optional(),
})

export const workflowInputSchema = z.object({
  query: z.string(),
  files: z.array(attachedFileSchema).optional().default([]),
})

const subtopicSchema = z.object({
  slug: z.string(),
  title: z.string(),
  contentOverview: z.string(),
})

const topicSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtopics: z.array(subtopicSchema),
})

const sectionSchema = z.object({
  title: z.string(),
  topics: z.array(topicSchema),
})

// ── Planner now also outputs doc-level title and slug ─────────────────────────
export const docsStructureSchema = z.object({
  docTitle: z.string(),   // e.g. "Java Exception Handling"
  docSlug: z.string(),    // e.g. "java-exception-handling" (no uid yet, we append later)
  docBrief: z.string(),
  sections: z.array(sectionSchema),
})

const topicWithContentSchema = topicSchema.extend({
  content: z.string(),
})

const sectionWithContentSchema = sectionSchema.extend({
  topics: z.array(topicWithContentSchema),
})

export const docsOutputSchema = z.object({
  docTitle: z.string(),
  docSlug: z.string(),
  docBrief: z.string(),
  sections: z.array(sectionWithContentSchema),
})

// Carries original query + full structure into step 2
const plannerOutputSchema = docsStructureSchema.extend({
  originalQuery: z.string(),
})

// ─── Step 1: Content Planner ──────────────────────────────────────────────────

const contentPlannerStep = createStep({
  id: 'content-planner-step',
  inputSchema: workflowInputSchema,
  outputSchema: plannerOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const { query, files } = inputData
    const agent = mastra.getAgent('contentPlannerAgent')

    type ContentPart =
      | { type: 'text'; text: string }
      | { type: 'image'; image: string; mimeType: string }
      | { type: 'file'; data: string; mimeType: string; filename: string }

    const messageContent: ContentPart[] = [
      {
        type: 'text',
        text: files.length > 0
          ? `User query: ${query}\n\nThe user has attached ${files.length} file(s). Analyze them thoroughly.`
          : `User query: ${query}`,
      },
    ]

    for (const file of files) {
      if (file.dataUri) {
        if (file.mimeType.startsWith('image/')) {
          messageContent.push({ type: 'image', image: file.dataUri, mimeType: file.mimeType })
        } else {
          messageContent.push({ type: 'file', data: file.dataUri, mimeType: file.mimeType, filename: file.name })
        }
      } else if (file.extractedText) {
        messageContent.push({ type: 'text', text: `[File: ${file.name}]\n\n${file.extractedText}` })
      }
    }

    const result = await agent.generate(
      [{ role: "user", content: messageContent }],
      {
        // structuredOutput: {schema: docsStructureSchema},
        modelSettings: {
          maxOutputTokens: 8192
        }
      }
    )

    const raw = result.text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const parsed = docsStructureSchema.parse(JSON.parse(jsonrepair(raw)))

    return { ...parsed, originalQuery: query }
  },
})

// ─── Step 2: Content Writer ───────────────────────────────────────────────────

const contentWriterStep = createStep({
  id: 'content-writer-step',
  inputSchema: plannerOutputSchema,
  outputSchema: docsOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const { sections, originalQuery, docTitle, docSlug, docBrief } = inputData
    const agent = mastra.getAgent('contentWriterAgent')

    const allTopics = sections.flatMap((section) =>
      section.topics.map((topic) => ({ topic, sectionTitle: section.title }))
    )

    const results = await Promise.all(
      allTopics.map(async ({ topic }) => {
        const subtopicList = topic.subtopics
          .map((st) => `## ${st.title}\n${st.contentOverview}`)
          .join('\n\n')

        const prompt = `
Original user query: ${originalQuery}

Page title: ${topic.title}

Subtopics to cover (in order):
${subtopicList}

Write the full markdown content for this documentation page. Use ## for each subtopic heading.
        `.trim()

        const response = await agent.generate(
          [{ role: 'user', content: prompt }],
          { modelSettings: { maxOutputTokens: 8192 } }
        )

        return { slug: topic.slug, content: response.text }
      })
    )

    const contentMap = new Map(results.map((r) => [r.slug, r.content]))

    const sectionsWithContent = sections.map((section) => ({
      ...section,
      topics: section.topics.map((topic) => ({
        ...topic,
        content: contentMap.get(topic.slug) ?? '',
      })),
    }))

    return { docTitle, docSlug, docBrief, sections: sectionsWithContent }
  },
})

// ─── Workflow ─────────────────────────────────────────────────────────────────

export const createDocsWorkflow = createWorkflow({
  id: 'create-docs-workflow',
  inputSchema: workflowInputSchema,
  outputSchema: docsOutputSchema,
})
  .then(contentPlannerStep)
  .then(contentWriterStep)
  .commit()