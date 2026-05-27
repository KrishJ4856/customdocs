import { Mastra } from '@mastra/core'
import { createAgents } from './agents/agent'
import { createDocsWorkflow } from './workflows/workflow'

export function createMastra(apiKey: string) {
  const agents = createAgents(apiKey)
  return new Mastra({
    agents,
    workflows: { createDocsWorkflow },
  })
}
