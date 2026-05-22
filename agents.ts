// todo: the goal is to get the agentic workflow working here
import "dotenv/config"

import { createTool } from '@mastra/core/tools'
import { Agent } from '@mastra/core/agent'

import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const docsStructureSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().describe("Heading of the section used to group related topics"),
      topics: z.array(
        z.object({
          slug: z.string().describe("Kebab case slug for a topic used as page route"),
          title: z.string().describe("Page title shown in the sidebar"),
          subtopics: z.array(
            z.object({
              slug: z.string().describe("kebab case slug for subtopics"),
              title: z.string().describe("title for subtopic shown in table of contents for a given page"),
              contentOverview: z.string().describe("overview of the content describing what the content writer agent should cover here")
            })
          )
        })
      )
    })
  )
})

const step1 = createStep({
  id: 'content-planner-step',
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: docsStructureSchema,
  execute: async ({ inputData }) => {
    
  },
})

export const testWorkflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    message: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  })
})
  .then(step1)
  .commit();