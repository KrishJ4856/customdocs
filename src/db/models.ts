import mongoose, { Schema, Document } from 'mongoose'

const SubtopicSchema = new Schema({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  contentOverview: { type: String, required: true },
}, { _id: false })

const UserSchema = new Schema({
  _id: { type: String },
  email: { type: String, required: true },
  name: { type: String, default: null },
  encryptedKey: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
})

const PageSchema = new Schema({
  docId: { type: Schema.Types.ObjectId, ref: 'Doc', required: true, index: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  sectionTitle: { type: String, required: true },
  sectionOrder: { type: Number, required: true, default: 0 },
  pageOrder: { type: Number, required: true, default: 0 },
  subtopics: {
    type: [SubtopicSchema],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const DocSchema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  firstPageSlug: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  fileUrls: { type: [String], default: [] },
  brief: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export interface IUser {
  _id: string
  email: string
  name: string | null
  encryptedKey: string | null
  createdAt: Date
}

export interface IDoc {
  _id: mongoose.Types.ObjectId
  userId: string
  title: string
  slug: string
  firstPageSlug: string
  isPublic: boolean
  fileUrls: string[]
  brief: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IPage {
  _id: mongoose.Types.ObjectId
  docId: mongoose.Types.ObjectId
  slug: string
  title: string
  content: string
  sectionTitle: string
  sectionOrder: number
  pageOrder: number
  subtopics: ISubtopic[]
  createdAt: Date
  updatedAt: Date
}

export interface ISubtopic {
  slug: string
  title: string
  contentOverview: string
}

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema)
export const Doc = (mongoose.models.Doc as mongoose.Model<IDoc>) || mongoose.model<IDoc>('Doc', DocSchema)
export const Page = (mongoose.models.Page as mongoose.Model<IPage>) || mongoose.model<IPage>('Page', PageSchema)

export type NewUser = { id: string; email: string; name: string | null }
export type NewDoc = {
  userId: string
  title: string
  slug: string
  firstPageSlug: string
  isPublic: boolean
  fileUrls: string[]
  brief: string | null
}
export type NewPage = {
  docId: string
  slug: string
  title: string
  content: string
  sectionTitle: string
  sectionOrder: number
  pageOrder: number
  subtopics: ISubtopic[]
}

export type Page = Pick<IPage, 'slug' | 'title' | 'content' | 'sectionTitle' | 'sectionOrder' | 'pageOrder' | 'subtopics'> & { id: string; docId: string; createdAt: string; updatedAt: string }
export type Doc = Pick<IDoc, 'title' | 'slug' | 'firstPageSlug' | 'isPublic' | 'fileUrls' | 'brief'> & { id: string; userId: string; createdAt: string; updatedAt: string }
export type User = Pick<IUser, 'email' | 'name'> & { id: string; createdAt: string }
