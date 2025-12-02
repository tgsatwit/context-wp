import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Context-First Organisation | Show me the context, and I’ll show you the output.",
  description: "Discover the Context-First Framework. Why AI demands we rethink how we work, and how structured Context Artefacts unlock the true potential of AI in your organisation.",
  keywords: ["AI", "Context-First", "Context Artefacts", "Organisational Efficiency", "Artificial Intelligence", "Business Strategy", "White Paper"],
  authors: [{ name: "Tim Gillam" }],
  creator: "Tim Gillam",
  openGraph: {
    title: "The Context-First Organisation | Show me the context, and I’ll show you the output.",
    description: "Discover the Context-First Framework. Why AI demands we rethink how we work, and how structured Context Artefacts unlock the true potential of AI in your organisation.",
    url: "https://example.com",
    siteName: "The Context-First Organisation",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Context-First Organisation",
    description: "Show me the context, and I’ll show you the output.",
  },
  alternates: {
    canonical: "https://example.com",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
