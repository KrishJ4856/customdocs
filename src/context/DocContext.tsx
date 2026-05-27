'use client'

import React, { createContext, useContext } from 'react'

interface DocPage {
  id: string
  docId: string
  slug: string
  title: string
  content: string
  sectionTitle: string
  sectionOrder: number
  pageOrder: number
  subtopics: { slug: string; title: string; contentOverview: string }[]
  createdAt: string
  updatedAt: string
}

interface DocContextValue {
  id: string
  title: string
  slug: string
  userId: string
  firstPageSlug: string
  pages: DocPage[]
}

const DocContext = createContext<DocContextValue | null>(null)

export function DocProvider({ doc, children }: { doc: DocContextValue; children: React.ReactNode }) {
  return React.createElement(DocContext.Provider, { value: doc }, children)
}

export function useDoc() {
  const doc = useContext(DocContext)
  if (!doc) throw new Error('useDoc must be used within a DocProvider')
  return doc
}
