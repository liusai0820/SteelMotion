"use client"

import type React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, FileVideo, Search, Sparkles } from "lucide-react"

import { AppShell } from "@/seq/components/app-shell"
import { CreditsDisplay } from "@/seq/components/shared"
import { STEEL_INDUSTRY_TEMPLATES } from "@/seq/lib/steelmotion/templates"

import {
  BrainIcon,
  CheckSquareIcon,
  FilmIcon,
  LinkIcon,
  MagicIcon,
  SlidersIcon,
  VideoIcon,
} from "./icons"

const PIPELINE_STEPS = [
  { label: "材料", description: "钢卷、钢板、型钢、管坯等原料质感", icon: BrainIcon },
  { label: "加工", description: "轧制、切割、焊接、热处理、检测", icon: LinkIcon },
  { label: "应用", description: "进入汽车、建筑、家电等真实场景", icon: CheckSquareIcon },
  { label: "高亮", description: "突出关键部件、性能指标和工艺优势", icon: SlidersIcon },
  { label: "收束", description: "Logo、口号、客户交付版片尾", icon: VideoIcon },
] as const

const WORKFLOW_ENTRIES = [
  {
    title: "从行业模板生成分镜",
    description: "选择汽车、水管、建筑、家电或工程机械，一键生成五段式钢材视频 prompt。",
    href: "/storyboard",
    icon: MagicIcon,
  },
  {
    title: "生成 1080p 静音片段",
    description: "默认走 Vidu Q3 Pro，参数已设为 1080p、无声音，方便先筛画面。",
    href: "/image-playground",
    icon: FileVideo,
  },
  {
    title: "进入剪辑工作台",
    description: "把保留的片段放进时间线，再加片头、片尾、Logo、水印和字幕。",
    href: "/timeline",
    icon: FilmIcon,
  },
] as const

export const LandingPage: React.FC = () => {
  return (
    <AppShell>
      <div className="min-h-screen bg-[var(--surface-0)] text-white overflow-x-hidden selection:bg-[var(--accent-muted)]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 bg-[var(--surface-0)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="输入钢材视频主题，例如：汽车高强钢发布片"
              className="w-full h-10 pl-10 pr-4 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-full text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <CreditsDisplay credits="unlimited" />
            <Link
              href="/storyboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-gradient text-accent-text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-shadow)]"
            >
              新建分镜
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main>
          <section className="px-6 pt-10 pb-12 border-b border-[var(--border-subtle)]">
            <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Vidu Q3 Pro · 1080p · 静音测试
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                    SteelMotion 钢材视频生成工作台
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-neutral-300 md:text-lg">
                    不是展示页，也不是素材社区。这里直接从钢材行业模板出发，生成分镜、调用视频模型、筛选片段，再进入剪辑导出。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/storyboard"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    从模板开始
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/timeline"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    打开剪辑台
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">当前生成配置</p>
                    <h2 className="mt-1 text-lg font-semibold">测试参数已就绪</h2>
                  </div>
                  <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    已加载 API
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-neutral-300">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span>模型</span>
                    <span className="font-medium text-white">Vidu Q3 Pro</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span>分辨率</span>
                    <span className="font-medium text-white">1080p</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <span>声音</span>
                    <span className="font-medium text-white">关闭</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>默认流程</span>
                    <span className="font-medium text-white">材料 → 加工 → 应用 → 高亮 → 收束</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-10 border-b border-[var(--border-subtle)]">
            <div className="max-w-6xl mx-auto">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-cyan-300">钢材行业模板</p>
                  <h2 className="mt-1 text-2xl font-semibold">先用这 5 个方向测试真实生成</h2>
                </div>
                <Link href="/storyboard" className="hidden text-sm text-neutral-300 transition hover:text-white md:block">
                  进入分镜工具
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                {STEEL_INDUSTRY_TEMPLATES.map((template) => (
                  <Link
                    key={template.id}
                    href={`/storyboard?template=${template.id}`}
                    className="group rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] p-4 transition hover:border-cyan-400/40 hover:bg-[var(--surface-2)]"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 transition group-hover:scale-105">
                      <MagicIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{template.name}</h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-neutral-400">{template.application}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-10 border-b border-[var(--border-subtle)]">
            <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
              {WORKFLOW_ENTRIES.map((entry) => {
                const Icon = entry.icon
                return (
                  <Link
                    key={entry.title}
                    href={entry.href}
                    className="group rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] p-5 transition hover:border-white/25 hover:bg-[var(--surface-2)]"
                  >
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <h3 className="mt-4 text-lg font-semibold">{entry.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">{entry.description}</p>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="px-6 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <p className="text-sm text-cyan-300">固定分镜链路</p>
                <h2 className="mt-1 text-2xl font-semibold">材料到品牌收束，先把结构跑通</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {PIPELINE_STEPS.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={step.label} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-xs text-neutral-600">0{index + 1}</span>
                      </div>
                      <h3 className="text-base font-semibold">{step.label}</h3>
                      <p className="mt-2 text-xs leading-5 text-neutral-400">{step.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  )
}
