import type { Metadata } from "next";
import { geistSans, geistMono } from "./fonts"
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/context/ThemeContext";
import { DocThemeProvider } from "@/context/DocThemeContext"
import { KeyModalProvider } from "@/context/KeyModalContext"
import Header from '@/components/Header'
import "./globals.css";
import 'highlight.js/styles/github-dark.css'

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
      <body className="min-h-full flex flex-col bg-gray-50/50 dark:bg-gray-950 transition-colors">
        <ClerkProvider>
          <ThemeProvider>
            <DocThemeProvider>
              <KeyModalProvider>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
              </KeyModalProvider>
            </DocThemeProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}