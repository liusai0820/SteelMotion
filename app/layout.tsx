import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { ErrorBoundary } from "@/seq/components/error-boundary"
import { Toaster, ToastProvider } from "@/seq/components/ui/sonner"
import { DeploymentNotice } from "@/seq/components/deployment-notice"

//@ts-ignore
import "./globals.css"

export const metadata: Metadata = {
  title: "SteelMotion - 钢材视频生成工作台",
  description:
    "从钢材行业模板生成分镜、视频片段和可导出的产品宣传片。",
  keywords: [
    "SteelMotion",
    "钢材视频生成",
    "钢铁行业宣传片",
    "分镜生成",
    "AI 视频生成",
    "Vidu",
    "视频剪辑",
  ],
  authors: [{ name: "v0" }],
  creator: "v0",
  publisher: "v0",
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "SteelMotion - 钢材视频生成工作台",
    description: "从钢材行业模板生成分镜、视频片段和可导出的产品宣传片。",
    siteName: "SteelMotion",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteelMotion - 钢材视频生成工作台",
    description: "从钢材行业模板生成分镜、视频片段和可导出的产品宣传片。",
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
      lang="zh-CN"
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
