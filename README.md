# CustomDocs

Generate beautiful, structured documentation for any topic using AI.

<img width="1255" height="1021" alt="image" src="https://github.com/user-attachments/assets/fd30f18e-2d83-40ee-adc4-e90dbd736b4b" />

## How it works

1. **Describe your topic** — Type what you want to learn, say "React hooks deep dive"
2. **AI builds the structure** — Content Planner agent analyzes your input and creates a structured outline with sections, topics, and subtopics
3. **Content gets written** — Content Writer agent generates thorough, engaging markdown for every page
4. **Read your docs** — Three-column documentation layout with sidebar navigation, in-page table of contents, and full markdown rendering

## Features

- **Three-column docs layout** — Sidebar navigation, content body, and in-page TOC. Looks and feels like professional dev documentation
- **Bring your own key** — You provide your own DeepSeek API key, encrypted and stored securely
- **Custom theming** — 8 built-in color themes plus custom Google Fonts support
- **Markdown rendering** — code syntax highlighting, tables, blockquotes, and more
- **Mobile responsive** — full three-column experience adapts to mobile with bottom navigation
- **Authentication** — Clerk-powered sign-up, profile management, and protected routes

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Database**: MongoDB + Mongoose
- **AI**: Mastra agents (Content Planner + Content Writer)
- **Model**: DeepSeek v4 Flash
- **Styling**: Tailwind CSS v4
- **Content**: React Markdown + rehype-highlight + remark-gfm

## Getting started

### Prerequisites

- Node.js >= 20
- MongoDB instance (local or Atlas)
- Clerk account (for auth)
- DeepSeek API key (each user provides their own)

### Setup

```bash
# Clone the repo
git clone https://github.com/KrishJ4856/customdocs.git
cd customdocs

# Install dependencies
npm install
```

Configure your `.env`:

```env
MONGODB_URI=your-mongodb-connection-string

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

ENCRYPTION_SECRET=a-random-string-for-encrypting-user-api-keys

DEMO_DOC_SLUG=a-doc-slug-to-show-on-demo-section  # optional
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── dashboard/        # Dashboard — create + view docs
│   ├── docs/[slug]/      # Doc viewer (3-column layout)
│   └── server/           # Server actions
├── components/
│   ├── docs/             # DocViewer, DemoSection
│   ├── keys/             # API key modal
│   └── navbar/           # Navbar extras (theme/font picker)
├── context/              # React contexts (theme, docs, key modal)
├── db/                   # Database layer
│   ├── models.ts         # Mongoose models (User, Doc, Page)
│   ├── queries.ts        # All database query functions
│   └── index.ts          # Connection + retry logic
├── lib/                  # Utilities (encryption)
├── mastra/               # Mastra AI agents & workflows
│   ├── agents/           # Content Planner + Content Writer agents
│   └── workflows/        # Doc creation workflow (plan → write)
└── middleware.ts          # Clerk route protection
```
