import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { jsonrepair } from "jsonrepair"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const attachedFileSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  base64: z.string(),
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

export const docsStructureSchema = z.object({
  sections: z.array(sectionSchema),
})

// Extends structure with content added per topic
const topicWithContentSchema = topicSchema.extend({
  content: z.string(),
})

const sectionWithContentSchema = sectionSchema.extend({
  topics: z.array(topicWithContentSchema),
})

export const docsOutputSchema = z.object({
  sections: z.array(sectionWithContentSchema),
})

// Step 1 carries forward the original query for writer context
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

    // Build multimodal message content
    // If files are attached, include them for the agent to analyze
    type ContentPart =
      | { type: 'text'; text: string }
      | { type: 'file'; data: string; mimeType: string; filename: string }

    const messageContent: ContentPart[] = [
      {
        type: 'text',
        text: files.length > 0
          ? `User query: ${query}\n\nThe user has also attached ${files.length} file(s). Analyze them thoroughly.`
          : `User query: ${query}`,
      },
    ]

    if (files.length > 0) {
      for (const file of files) {
        messageContent.push({
          type: 'file',
          data: file.base64,
          mimeType: file.mimeType,
          filename: file.name,
        })
      }
    }

    const result = await agent.generate(
      [{role: "user", content: messageContent}],
      {
        // structuredOutput: {schema: docsStructureSchema},
        modelSettings: {
          maxOutputTokens: 8192
        }
      }
    )

    const raw = result.text
    .replace(/^```json\s*/i, '')  // strip opening fence
    .replace(/^```\s*/i, '')      // or plain ```
    .replace(/```\s*$/i, '')      // strip closing fence
    .trim()

    const parsed = docsStructureSchema.parse(JSON.parse(jsonrepair(raw)))

    return {
      ...parsed,
      originalQuery: query,
    }
  },
})

// ─── Step 2: Content Writer ───────────────────────────────────────────────────

const contentWriterStep = createStep({
  id: 'content-writer-step',
  inputSchema: plannerOutputSchema,
  outputSchema: docsOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const { sections, originalQuery } = inputData

    const agent = mastra.getAgent('contentWriterAgent')

    // Flatten all topics from all sections for parallel generation
    const allTopics = sections.flatMap((section) =>
      section.topics.map((topic) => ({ topic, sectionTitle: section.title }))
    )

    // Generate content for every topic in parallel
    const results = await Promise.all(
      allTopics.map(async ({ topic }) => {
        const subtopicList = topic.subtopics
          .map((st) => `### ${st.title}\n${st.contentOverview}`)
          .join('\n\n')

        const prompt = `
Original user query: ${originalQuery}

Page title: ${topic.title}

Subtopics to cover (in order):
${subtopicList}

Write the full markdown content for this documentation page. Cover each subtopic using ## ${'{subtopic title}'} as the heading.
        `.trim()

        const response = await agent.generate(
          [{role: "user", content: prompt}]
        )
        return { slug: topic.slug, content: response.text }
      })
    )

    // Map generated content back onto the original structure
    const contentMap = new Map(results.map((r) => [r.slug, r.content]))

    const sectionsWithContent = sections.map((section) => ({
      ...section,
      topics: section.topics.map((topic) => ({
        ...topic,
        content: contentMap.get(topic.slug) ?? '',
      })),
    }))

    return { sections: sectionsWithContent }
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