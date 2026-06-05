"use client"

import type { MediaItem, StoryboardPanel, TimelineClip } from "./types"
import dynamic from "next/dynamic"
import { DEMO_FINAL_SEQUENCE } from "@/seq/lib/demo-data"
import { loadSession } from "@/seq/lib/session-storage"
import { STEELMOTION_DEMO_PANELS } from "@/seq/lib/steelmotion/test-assets"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useIsMobile } from "@/seq/hooks/use-is-mobile"
import { MobileEditorNotice } from "./components/mobile-editor-notice"

const Editor = dynamic(() => import("./components/editor").then((mod) => mod.Editor), { ssr: false })

function createDemoData() {
  const initialMedia: MediaItem[] = DEMO_FINAL_SEQUENCE.panels.map((p, i) => ({
    id: `media-${i}`,
    url: p.videoUrl,
    prompt: p.prompt,
    duration: p.duration,
    aspectRatio: DEMO_FINAL_SEQUENCE.videoConfig.aspectRatio,
    status: "ready" as const,
    type: "video" as const,
    resolution: { width: 1280, height: 720 },
  }))

  const initialClips: TimelineClip[] = []
  let startTime = 0

  initialMedia.forEach((m, i) => {
    initialClips.push({
      speed: 1,
      id: `clip-${i}`,
      mediaId: m.id,
      trackId: "v1",
      start: startTime,
      duration: m.duration,
      offset: 0,
      transition: undefined,
    })
    startTime += m.duration
  })

  const initialStoryboard: StoryboardPanel[] = DEMO_FINAL_SEQUENCE.panels.map((p, i) => ({
    id: `sb-${i}`,
    prompt: p.prompt,
    imageUrl: p.imageUrl,
    linkedImageUrl: p.linkedImageUrl,
    videoUrl: p.videoUrl,
    mediaId: `media-${i}`,
    status: "idle" as const,
    type: p.linkedImageUrl ? ("transition" as const) : ("scene" as const),
    duration: p.duration as 5 | 8,
  }))

  return { initialMedia, initialClips, initialStoryboard }
}

export { createDemoData }

function getSessionEntries(videoUrls: Record<number, string> | undefined): Array<[number, string]> {
  if (!videoUrls) return []
  return Object.entries(videoUrls)
    .map(([index, url]) => [Number(index), url] as [number, string])
    .filter(([index, url]) => Number.isFinite(index) && url.trim().length > 0)
    .sort(([a], [b]) => a - b)
}

function createGeneratedStoryboardData() {
  const session = loadSession()
  const entries = getSessionEntries(session?.videoUrls)
  if (entries.length === 0) return null

  const aspectRatio = session?.videoConfig?.aspectRatio || "16:9"
  const initialMedia: MediaItem[] = entries.map(([index, url]) => {
    const panel = STEELMOTION_DEMO_PANELS[index]
    return {
      id: `steelmotion-generated-media-${index}`,
      url,
      prompt: session?.prompts?.[index] || panel?.prompt || `SteelMotion 生成片段 ${index + 1}`,
      duration: session?.durations?.[index] || 5,
      aspectRatio,
      status: "ready" as const,
      type: "video" as const,
      resolution: { width: 1920, height: 1080 },
    }
  })

  const initialClips: TimelineClip[] = []
  let startTime = 0
  initialMedia.forEach((media) => {
    initialClips.push({
      speed: 1,
      id: `steelmotion-generated-clip-${media.id}`,
      mediaId: media.id,
      trackId: "v1",
      start: startTime,
      duration: media.duration,
      offset: 0,
      volume: 1,
    })
    startTime += media.duration
  })

  const initialStoryboard: StoryboardPanel[] = entries.map(([index, url]) => {
    const panel = STEELMOTION_DEMO_PANELS[index]
    return {
      id: `steelmotion-generated-storyboard-${index}`,
      prompt: session?.prompts?.[index] || panel?.prompt || "",
      imageUrl: panel?.imageUrl,
      videoUrl: url,
      mediaId: `steelmotion-generated-media-${index}`,
      status: "idle" as const,
      type: "scene" as const,
      duration: (session?.durations?.[index] || 5) as 3 | 5 | 8,
    }
  })

  return { initialMedia, initialClips, initialStoryboard }
}

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadDemo = searchParams.get("demo") === "true"

  const isMobile = useIsMobile()
  if (isMobile) {
    return <MobileEditorNotice />
  }

  const generatedData = loadDemo ? null : createGeneratedStoryboardData()
  const demoData = loadDemo ? createDemoData() : generatedData

  return (
    <Editor
      initialStoryboard={demoData?.initialStoryboard}
      initialMedia={demoData?.initialMedia}
      initialClips={demoData?.initialClips}
      onBack={() => {
        router.push("/")
      }}
    />
  )
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[var(--surface-0)] text-white">
          Loading editor...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}

export default App
