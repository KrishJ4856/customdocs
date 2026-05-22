import { Mastra } from '@mastra/core'
import { contentPlannerAgent, contentWriterAgent } from './agents/agent'
import { createDocsWorkflow } from './workflows/workflow'

export const mastra = new Mastra({
  agents: {
    contentPlannerAgent,
    contentWriterAgent,
  },
  workflows: {
    createDocsWorkflow,
  },
})