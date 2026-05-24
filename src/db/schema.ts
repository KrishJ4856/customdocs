import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Users ──────────────────────────────────────────────────────────────────────
// Mirrors Clerk — we store just what we need
export const users = pgTable('users', {
  id: text('id').primaryKey(),           // Clerk user ID (e.g. user_2abc...)
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Docs ───────────────────────────────────────────────────────────────────────
// One row per documentation set a user creates
export const docs = pgTable('docs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  isPublic: boolean('is_public').default(false).notNull(),
  fileUrls: jsonb('file_urls').$type<string[]>().default([]),
  brief: text('brief'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Pages ──────────────────────────────────────────────────────────────────────
// One row per topic/page within a doc
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  docId: uuid('doc_id')
    .notNull()
    .references(() => docs.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),           // full markdown string
  sectionTitle: text('section_title').notNull(), // which sidebar group this belongs to
  sectionOrder: integer('section_order').notNull().default(0),
  pageOrder: integer('page_order').notNull().default(0),
  // subtopics stored as jsonb — [{slug, title, contentOverview}]
  // used to build the right-column TOC, no need for a separate table
  subtopics: jsonb('subtopics')
    .$type<{ slug: string; title: string; contentOverview: string }[]>()
    .default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Relations (for Drizzle query API) ─────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  docs: many(docs),
}))

export const docsRelations = relations(docs, ({ one, many }) => ({
  user: one(users, { fields: [docs.userId], references: [users.id] }),
  pages: many(pages),
}))

export const pagesRelations = relations(pages, ({ one }) => ({
  doc: one(docs, { fields: [pages.docId], references: [docs.id] }),
}))

// ── Types ──────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Doc = typeof docs.$inferSelect
export type NewDoc = typeof docs.$inferInsert
export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert