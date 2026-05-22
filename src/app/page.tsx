import Link from "next/link"
import { SignUpButton, SignInButton, Show } from "@clerk/nextjs"

export default function LandingPage() {
  return (
    <main className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
        {/* Radial fade on top of grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_50%,white_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_50%,#09090b_100%)]" />

        <div className="relative z-10 flex flex-col items-center gap-5 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            AI-powered documentation
          </span>

          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-tight text-gray-950 dark:text-gray-50 leading-[1.08]">
            Your notes deserve<br />
            <span className="text-indigo-600 dark:text-indigo-400">better than a PDF.</span>
          </h1>

          <p className="max-w-lg text-[1.0625rem] text-gray-500 dark:text-gray-400 leading-relaxed">
            Turn any topic, syllabus, or study material into a structured, beautiful documentation site — in seconds.
          </p>

          <div className="flex items-center gap-2.5 mt-1">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-gray-950"
              >
                Go to dashboard <span aria-hidden>→</span>
              </Link>
            </Show>
            <Show when="signed-out">
              <SignUpButton>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-gray-950">
                  Get started free <span aria-hidden>→</span>
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900">
                  Sign in
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-6 py-24 dark:border-gray-800/80">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
            The problem
          </p>
          <h2 className="mb-14 max-w-xl text-[1.75rem] font-semibold leading-snug text-gray-900 dark:text-gray-100">
            You have great material to study. The format is letting you down.
          </h2>

          <div className="grid gap-px rounded-xl border border-gray-100 bg-gray-100 overflow-hidden sm:grid-cols-3 dark:border-gray-800 dark:bg-gray-800">
            {[
              {
                label: "Raw PDFs",
                desc: "Walls of text, no navigation. Hard to scan, impossible to share cleanly.",
              },
              {
                label: "Markdown files",
                desc: "No sidebar, no hierarchy. Content lives on disk and dies there.",
              },
              {
                label: "Scattered notes",
                desc: "Context lives in your head. Not structured, not shareable, not revisitable.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 bg-white p-7 dark:bg-gray-950"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.label}
                </p>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-24 dark:border-gray-800/80 dark:bg-gray-900/40">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
            How it works
          </p>
          <h2 className="mb-16 text-[1.75rem] font-semibold text-gray-900 dark:text-gray-100">
            Three steps to docs you&apos;ll actually want to read.
          </h2>

          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Give your material",
                desc: "Type a topic, paste a syllabus, or upload a PDF. Vague or detailed — it works either way.",
              },
              {
                n: "02",
                title: "AI structures it",
                desc: "Agents analyze your input, group concepts into topics, and write deep, engaging content per page.",
              },
              {
                n: "03",
                title: "Share your docs",
                desc: "Get a dev-docs style site with sidebar navigation. One link, shareable with anyone.",
              },
            ].map((item) => (
              <div key={item.n} className="flex flex-col gap-4">
                <span className="font-mono text-xs text-indigo-500">{item.n}</span>
                <div className="h-px w-8 bg-indigo-200 dark:bg-indigo-800" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-6 py-24 dark:border-gray-800/80">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
            What you get
          </p>
          <h2 className="mb-14 text-[1.75rem] font-semibold text-gray-900 dark:text-gray-100">
            Everything a great doc site needs.
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Dev-docs layout",
                desc: "Three-column structure with sidebar, content, and in-page TOC. Looks like Stripe docs. Feels familiar.",
              },
              {
                title: "AI editing",
                desc: "Tell the AI to add a section, rewrite a page, or restructure. It has full context of your docs.",
              },
              {
                title: "Public sharing",
                desc: "One toggle makes your docs public. Share a single link. Anyone with it can read, not edit.",
              },
              {
                title: "Community docs",
                desc: "Browse docs created by the community. Study from great docs others have built. Coming soon.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-xl border border-gray-100 p-6 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40 dark:border-gray-800 dark:hover:border-indigo-900/60 dark:hover:bg-indigo-950/20"
              >
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="border-t border-gray-100 px-6 py-28 dark:border-gray-800/80">
        <div className="mx-auto max-w-4xl flex flex-col items-center text-center gap-5">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-gray-950 dark:text-gray-50">
            Your next exam starts here.
          </h2>
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-gray-500 dark:text-gray-400">
            Stop staring at PDFs. Turn your study material into docs worth reading.
          </p>
          <Show when="signed-out">
            <SignUpButton>
              <button className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-950 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-gray-950">
                Create your first doc <span aria-hidden>→</span>
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-950 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-gray-950"
            >
              Go to Dashboard <span aria-hidden>→</span>
            </Link>
          </Show>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-6 py-5 dark:border-gray-800/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            CustomDocs
          </span>
          <span className="text-xs text-gray-400">Built for students who care about design.</span>
        </div>
      </footer>

    </main>
  )
}