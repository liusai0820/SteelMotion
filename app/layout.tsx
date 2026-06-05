import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { ErrorBoundary } from "@/seq/components/error-boundary"
import { Toaster, ToastProvider } from "@/seq/components/ui/sonner"
import { DeploymentNotice } from "@/seq/components/deployment-notice"

//@ts-ignore
import "./globals.css"

export const metadata: Metadata = {
  title: "SteelMotion - Steel Industry Storyboard to Video Studio",
  description:
    "Generate steel industry storyboards, video clips, and export-ready product sequences with provider-swappable AI video models.",
  keywords: [
    "SteelMotion",
    "steel video generation",
    "steel industry marketing",
    "storyboard to video",
    "AI video generation",
    "magnetic timeline",
    "video editor",
    "Veo 3.1",
    "fal.ai",
    "video sequence",
    "AI filmmaking",
  ],
  authors: [{ name: "v0" }],
  creator: "v0",
  publisher: "v0",
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SteelMotion - Steel Industry Storyboard to Video Studio",
    description:
      "Generate steel industry storyboards, video clips, and export-ready product sequences with AI video models.",
    siteName: "SteelMotion",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteelMotion - Steel Industry Storyboard to Video Studio",
    description:
      "Generate steel industry storyboards, video clips, and export-ready product sequences with AI video models.",
    creator: "@vercel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ backgroundColor: "#000000" }}
    >
      <head />
      <body className="font-sans antialiased" style={{ backgroundColor: "#000000" }}>
        <ToastProvider>
          <ErrorBoundary>
            <Suspense fallback={null}>{children}</Suspense>
          </ErrorBoundary>
          <Toaster />
          <DeploymentNotice />
        </ToastProvider>
      </body>
    </html>
  )
}
