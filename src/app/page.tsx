import { playwrite, googleSansFlex } from "@/app/fonts"
import DemoSection from "@/components/docs/DemoSection"
import { Show, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex pt-32 pb-15 flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
        {/* Radial fade on top of grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_50%,white_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_50%,#09090b_100%)]" />

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-6xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--doc-section-color) bg-(--doc-active-bg) px-3.5 py-1 text-xs font-medium text-(--doc-active-text) dark:border-(--doc-active-text) dark:bg-(--doc-active-bg) dark:text-(--doc-active-text)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--doc-accent) animate-ping" />
            Powered by DeepSeek v4 Flash - Bring Your Own Key!
          </span>

          <h1 className={`${playwrite.className} text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-tight text-gray-950 dark:text-gray-50 leading-[1.08] mb-[20px]`}>
            make learning,
            <span className="text-(--doc-accent)"> great again!</span>
          </h1>

          <p className={`${googleSansFlex.className} max-w-2xl text-[1.2rem] text-gray-500 dark:text-gray-400 leading-relaxed`}>
            Get beautifully 🎀 structured docs for any topic you want to learn 📒
          </p>

          <div className="flex flex-col items-center gap-3 mt-4 sm:hidden">
            <Show when="signed-in">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100">
                Dashboard →
              </Link>
            </Show>
            <Show when="signed-out">
              <SignUpButton>
                <button className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 cursor-pointer">
                  Get started
                </button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </section>

      {/* ── Demo Docs Section ────────────────────────────────── */}
      <DemoSection />

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-6 py-5 dark:border-gray-800/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            CustomDocs
          </span>
          <span className="text-xs text-(--doc-accent)">Built for students who care about design.</span>
        </div>
      </footer>

    </main>
  )
}