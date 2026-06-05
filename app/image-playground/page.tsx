import { ImageCombiner } from "@/seq/components/image-combiner"
import type { Metadata } from "next"
import { AppShell } from "@/seq/components/app-shell"

export const metadata: Metadata = {
  title: "Image Playground - SteelMotion",
  description:
    "AI-powered image generation and editing for steel industry storyboard assets and product visuals.",
}

export default function Home() {
  return (
    <AppShell>
      <ImageCombiner />
    </AppShell>
  )
}
