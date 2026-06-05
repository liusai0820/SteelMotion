import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Download, ExternalLink, Film, Images } from "lucide-react"

import { AppShell } from "@/seq/components/app-shell"
import { STEELMOTION_TEST_FRAMES } from "@/seq/lib/steelmotion/test-assets"

export const metadata: Metadata = {
  title: "测试图片 - SteelMotion",
  description: "用于 SteelMotion 图生视频演示的钢材行业测试图片。",
}

export default function ImagePlaygroundPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[var(--surface-0)] px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Images className="h-3.5 w-3.5" />
                演示素材
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">图生视频测试图</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                这几张图只放裸材料：钢卷、板坯、棒料。你可以把它们作为 Vidu 图生视频的起始图，让 prompt 去演示“原材料 → 加工 → 汽车部件应用”的过程。
              </p>
            </div>

            <Link
              href="/storyboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              进入分镜生成
              <Film className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {STEELMOTION_TEST_FRAMES.map((asset, index) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)]"
              >
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
                <div className="space-y-4 p-4">
                  <div>
                    <h2 className="text-lg font-semibold">{asset.title}</h2>
                    <p className="mt-1 text-xs text-cyan-300">{asset.stage}</p>
                    <p className="mt-2 line-clamp-4 text-xs leading-5 text-neutral-400">{asset.prompt}</p>
                  </div>

                  <div className="rounded-md border border-[var(--border-default)] bg-black/25 px-3 py-2 text-xs text-neutral-300">
                    <span className="text-neutral-500">本地路径：</span>
                    <code>{asset.url}</code>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={asset.url}
                      download
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                    >
                      <Download className="h-3.5 w-3.5" />
                      下载图片
                    </a>
                    <Link
                      href="/storyboard"
                      className="inline-flex items-center justify-center rounded-md border border-white/15 px-3 py-2 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  )
}
