"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, Play, Trash2, Film, RefreshCw, Download, Sparkles, Link2 } from "lucide-react"
import { Button } from "@/seq/components/ui/button"
import { Textarea } from "@/seq/components/ui/textarea"
import { Badge } from "@/seq/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/seq/components/ui/select"
import type { StoryboardPanelData, VideoConfig, VideoModel } from "./types"
import { cn } from "@/seq/lib/utils"
import Image from "next/image"
import { VIDEO_MODELS } from "@/seq/components/editor/constants"

interface StoryboardPanelProps {
  panel: StoryboardPanelData
  index: number
  masterDescription: string
  videoConfig: VideoConfig
  onUpdate: (id: string, updates: Partial<StoryboardPanelData>) => void
  onRemove: (id: string) => void
  onGenerate: (id: string) => void
}

export function StoryboardPanel({
  panel,
  index,
  masterDescription,
  videoConfig,
  onUpdate,
  onRemove,
  onGenerate,
}: StoryboardPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isTransitionPanel = !!panel.linkedImageUrl

  useEffect(() => {
    if (panel.videoUrl && isPlaying && videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false))
    } else if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [isPlaying, panel.videoUrl])

  const handleEnhance = async () => {
    if (!masterDescription.trim() && !panel.prompt.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/seq/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: panel.imageUrl,
          masterDescription: masterDescription,
          panelPrompt: panel.prompt,
        }),
      })

      if (!response.ok) throw new Error("优化失败")

      const data = await response.json()
      if (data.enhancedPrompt) {
        onUpdate(panel.id, { prompt: data.enhancedPrompt })
      }
    } catch (error) {
      console.error("Enhance failed", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card group relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            分镜 {index + 1}
          </Badge>
          {isTransitionPanel && (
            <Badge variant="secondary" className="text-xs">
              <Link2 className="w-3 h-3" />
              首尾帧
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {panel.videoUrl ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs bg-transparent"
              onClick={() => onGenerate(panel.id)}
              disabled={panel.isGenerating}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              重试
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-7 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onGenerate(panel.id)}
              disabled={panel.isGenerating || !panel.prompt.trim()}
            >
              <Film className="mr-1 h-3.5 w-3.5" />
              生成当前片段
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(panel.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative aspect-video bg-background group/preview">
        {panel.videoUrl ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={panel.videoUrl}
              className="w-full h-full object-contain"
              loop
              playsInline
              onEnded={() => setIsPlaying(false)}
            />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity",
                isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100",
              )}
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-12 w-12 bg-muted/80 hover:bg-primary backdrop-blur-sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <div className="h-4 w-4 bg-white rounded-sm" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5 text-white" />
                )}
              </Button>
            </div>

            {/* Download Action */}
            <div className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
              <a href={panel.videoUrl} download target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/50 hover:bg-background/70">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {isTransitionPanel && panel.linkedImageUrl ? (
              <div className="w-full h-full flex gap-0.5">
                <div className="relative w-1/2 h-full">
                  <Image
                    src={panel.imageUrl || "/placeholder.svg"}
                    alt="首帧"
                    fill
                    priority={index < 3}
                    className="object-contain"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white/80">
                    首帧
                  </div>
                </div>
                <div className="relative w-1/2 h-full">
                  <Image
                    src={panel.linkedImageUrl || "/placeholder.svg"}
                    alt="尾帧"
                    fill
                    priority={index < 3}
                    className="object-contain"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white/80">
                    尾帧
                  </div>
                </div>
              </div>
            ) : (
              <Image
                src={panel.imageUrl || "/placeholder.svg"}
                alt={`分镜 ${index + 1}`}
                fill
                priority={index < 3}
                className="object-contain"
              />
            )}
            {!panel.isGenerating && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {panel.isGenerating && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <span className="text-xs text-white/80 font-medium animate-pulse">正在生成视频...</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-1 flex-col gap-3 bg-card p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_80px] gap-2">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              视频模型
            </label>
            <Select
              value={panel.model || "vidu:viduq3-pro"}
              onValueChange={(val) => onUpdate(panel.id, { model: val as VideoModel })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="vidu:viduq3-pro" />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">时长</label>
            <Select
              value={panel.duration?.toString() || "5"}
              onValueChange={(val) => onUpdate(panel.id, { duration: Number.parseInt(val) as 3 | 5 | 8 })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 秒</SelectItem>
                <SelectItem value="5">5 秒</SelectItem>
                <SelectItem value="8">8 秒</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-[9px] text-muted-foreground/50 leading-tight">
          {isTransitionPanel ? "首尾帧片段建议使用支持首尾帧的模型" : "默认 Vidu Q3 Pro，1080p，无声音"}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              视频 Prompt
            </label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-5 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                onClick={handleEnhance}
                disabled={isEnhancing || (!masterDescription.trim() && !panel.prompt.trim())}
              >
                {isEnhancing ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                优化
              </Button>
              <span className="text-[10px] text-muted-foreground/50">{panel.prompt.length} 字</span>
            </div>
          </div>
          <Textarea
            value={panel.prompt}
            onChange={(e) => onUpdate(panel.id, { prompt: e.target.value })}
            placeholder={
              isTransitionPanel
                ? "描述首尾帧之间的运动，例如：镜头从钢卷推进到产线。"
                : "描述这个镜头如何运动，例如：缓慢推进、轻微横移、突出金属反光。"
            }
            className="min-h-[96px] text-xs resize-none bg-[var(--surface-2)] border-[var(--border-default)] focus:border-[var(--accent-muted)] text-neutral-200 placeholder:text-neutral-500 font-mono"
          />
        </div>

        {panel.videoUrl && (
          <a
            href={panel.videoUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            下载视频
          </a>
        )}

        {panel.error && <div className="text-[10px] text-destructive px-1">错误：{panel.error}</div>}
      </div>
    </div>
  )
}
