// Temporary in-memory store — replace with Neon DB later
// Lives on the server, persists for the lifetime of the dev server process

export interface StoredDoc {
  slug: string
  title: string
  sections: Section[]
  createdAt: string
}

export interface Section {
  title: string
  topics: Topic[]
}

export interface Topic {
  slug: string
  title: string
  content: string
  subtopics: Subtopic[]
}

export interface Subtopic {
  slug: string
  title: string
  contentOverview: string
}

// Global store — in dev this persists across requests
const docStore = new Map<string, StoredDoc>()

export function saveDoc(doc: StoredDoc): void {
  docStore.set(doc.slug, doc)
}

export function getDoc(slug: string): StoredDoc | undefined {
  return docStore.get(slug)
}

export function getFirstTopic(doc: StoredDoc): Topic | undefined {
  return doc.sections[0]?.topics[0]
}