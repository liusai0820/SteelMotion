import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Film, LayoutGrid } from "lucide-react"

import { AppShell } from "@/seq/components/app-shell"
import { StoryboardContainer } from "@/seq/components/storyboard/storyboard-container"
import { STEELMOTION_DEMO_PANELS, STEELMOTION_TEST_FRAMES } from "@/seq/lib/steelmotion/test-assets"

export const metadata: Metadata = {
  title: "分镜生成 - SteelMotion",
  description: "使用钢材行业测试图生成 Vidu Q3 视频片段。",
}

const initialPrompts = STEELMOTION_DEMO_PANELS.reduce<Record<number, string>>((acc, panel, index) => {
  acc[index] = panel.prompt
  return acc
}, {})

const initialDurations = STEELMOTION_DEMO_PANELS.reduce<Record<number, number>>((acc, _panel, index) => {
  acc[index] = 5
  return acc
}, {})

export default function StoryboardPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border px-6 py-7">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  图片到视频演示
                </div>
                <h1 className="text-3xl font-semibold md:text-4xl">钢材分镜生成</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  下方已载入三张裸材料图。图片只负责提供原始钢材，视频会通过中文 prompt 演示材料如何加工并最终用在汽车部件上。默认模型是 Vidu Q3 Pro，分辨率 1080p，声音关闭。
                </p>
              </div>

              <Link
                href="/timeline"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                打开剪辑台
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {STEELMOTION_TEST_FRAMES.map((asset, index) => (
                <div key={asset.id} className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative aspect-video bg-black">
                    <Image
                      src={asset.url}
                      alt={asset.title}
                      fill
                      priority={index < 3}
                      className="object-cover"
                      sizes="33vw"
                    />
                  </div>
                  <div className="p-3">
                    <h2 className="text-sm font-semibold">{asset.title}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{asset.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="h-[620px] border-b border-border">
          <StoryboardContainer
            initialPanels={STEELMOTION_DEMO_PANELS.map((panel) => panel.imageUrl)}
            prompts={initialPrompts}
            durations={initialDurations}
          />
        </section>

        <section className="px-6 py-6">
          <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            <Film className="h-4 w-4 text-primary" />
            演示顺序：确认图片和 prompt → 点击“生成当前片段”或“生成全部视频” → 成功后进入剪辑台做片头、片尾、Logo、水印和字幕。
          </div>
        </section>
      </main>
    </AppShell>
  )
}
