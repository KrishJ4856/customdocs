import { Geist, Geist_Mono, Playwrite_GB_S, Google_Sans_Flex } from "next/font/google"

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const playwrite = Playwrite_GB_S({
  weight: '400',
  style: 'normal',
  display: 'swap',
})

export const googleSansFlex = Google_Sans_Flex({
  weight: "400"
})
