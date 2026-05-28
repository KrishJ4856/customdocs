'use client'

import ThemeSwitcher from "@/components/ThemeSwitcher"
import NavbarExtras from "@/components/navbar/NavbarExtras"
import { useKeyModal } from '@/context/KeyModalContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Show, SignUpButton, UserButton } from '@clerk/nextjs'
import { googleSansFlex, playwrite } from "../app/fonts"

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)

export default function Header() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'
  const { openKeyModal } = useKeyModal()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200/80 px-3 sm:px-6 py-3.5 backdrop-blur-xl dark:border-gray-800/80 transition-colors dark:bg-black/60">
      <Link
        href="/"
        className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div> */}
        <span className={`${playwrite.className} text-base sm:text-xl tracking-tight transition-colors text-black dark:text-white font-bold`}>
          custom<span className={`${playwrite.className} transition-colors text-(--doc-accent)`}>Docs</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        <NavbarExtras />

        {!isDashboard && (
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="group hidden sm:inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.98] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
              >
                Dashboard
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </Show>

            <Show when="signed-out">
              <SignUpButton>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.98] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 cursor-pointer">
                  Get started
                </button>
              </SignUpButton>
            </Show>
          </div>
        )}

        <Show when="signed-in">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="Key"
                labelIcon={<KeyIcon />}
                onClick={openKeyModal}
              />
            </UserButton.MenuItems>
          </UserButton>
        </Show>

        <ThemeSwitcher />
      </div>
    </header>
  )
}
