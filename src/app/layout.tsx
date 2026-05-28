import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
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
  title: 'CustomDocs — AI-powered documentation for any topic',
  description: 'Turn any topic into beautifully structured docs. Type what you want to learn and AI plans, writes, and delivers a full documentation site with sidebar navigation, code examples, and syntax highlighting.',
  openGraph: {
    title: 'CustomDocs — AI-powered documentation for any topic',
    description: 'Turn any topic into beautifully structured docs using AI.',
    url: 'https://customdocs.app',
    siteName: 'CustomDocs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CustomDocs — AI-powered documentation for any topic',
    description: 'Turn any topic into beautifully structured docs using AI.',
  },
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
        <Analytics />
      </body>
    </html>
  );
}