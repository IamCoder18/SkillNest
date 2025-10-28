import type React from "react"
import type { Metadata } from "next"
import { Geist } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"



export const metadata: Metadata = {
  title: "SkillNest - Learn. Build. Share.",
  description:
    "Alberta's Community for Trades & Maker Skills. Connect with local experts who have the tools, space, and know-how.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${geistSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Navbar />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
