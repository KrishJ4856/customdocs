import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import "./globals.css";

import 'highlight.js/styles/github-dark.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Custom Docs",
  description: "A Next.js app with Clerk auth and theme switcher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ThemeProvider>
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Custom Docs
              </span>
              <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <Show when="signed-out">
                  <div className="flex items-center gap-2">
                    <SignInButton />
                    <SignUpButton />
                  </div>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
