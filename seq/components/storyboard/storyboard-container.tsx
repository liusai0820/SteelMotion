"use client"
import { Film, Layers, Wand2, Settings2 } from "lucide-react"
import type React from "react"

import { Button } from "@/seq/components/ui/button"
import { ScrollArea, ScrollBar } from "@/seq/components/ui/scroll-area"
import { StoryboardPanel } from "./storyboard-panel"
import type { StoryboardPanelData, VideoConfig, VideoModel } from "./types"
import { useToastContext } from "@/seq/components/ui/sonner"
import { useEffect, useState, useRef, useCallback } from "react"
import { Textarea } from "@/seq/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/seq/components/ui/select"
import { saveSession, loadSession, clearSession } from "@/seq/lib/session-storage"
import type { CostLog, Generation, GenerationStatus } from "@/seq/lib/steelmotion/types"

interface VideoGenerationResponse {
  url?: string
  status?: GenerationStatus
  data?: {
    video?: {
      url?: string
    }
  }
  generation?: Generation
  costLog?: CostLog
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (isRecord(value) && typeof value.error === "string") return value.error
  return "视频生成失败"
}

function parseVideoGenerationResponse(value: unknown): VideoGenerationResponse {
  if (!isRecord(value)) return {}

  const data = isRecord(value.data) ? value.data : undefined
  const video = data && isRecord(data.video) ? data.video : undefined

  return {
    url: typeof value.url === "string" ? value.url : undefined,
    status: typeof value.status === "string" ? (value.status as GenerationStatus) : undefined,
    data: video && typeof video.url === "string" ? { video: { url: video.url } } : undefined,
    generation: isRecord(value.generation) ? (value.generation as unknown as Generation) : undefined,
    costLog: isRecord(value.costLog) ? (value.costLog as unknown as CostLog) : undefined,
  }
}

interface StoryboardContainerProps {
  panels?: StoryboardPanelData[]
  setPanels?: (panels: StoryboardPanelData[]) => void
  initialPanels?: string[]
  linkedPanelData?: Record<number, string>
  prompts?: Record<number, string>
  durations?: Record<number, number>
  videoUrls?: Record<number, string>
}

const DEFAULT_MASTER_DESCRIPTION =
  "真实工业广告片风格，冷色厂房灯光，镜头缓慢推进，突出裸钢材料质感、加工过程和最终汽车部件应用。无字幕，无配音，无音乐。"

export function StoryboardContainer({
  panels: propPanels,
  setPanels: propSetPanels,
  initialPanels,
  linkedPanelData: initialLinkedPanelData,
  prompts: initialPrompts,
  durations: initialDurations,
  videoUrls: initialVideoUrls,
}: StoryboardContainerProps) {
  const { toast } = useToastContext()
  const [internalPanels, setInternalPanels] = useState<StoryboardPanelData[]>([])
  const [masterDescription, setMasterDescription] = useState(DEFAULT_MASTER_DESCRIPTION)
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    aspectRatio: "16:9",
    useFastModel: true,
    provider: "vidu",
    model: "vidu:viduq3-pro",
  })

  const [leftWidth, setLeftWidth] = useState(35)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const panels = propPanels || internalPanels
  const setPanels = propSetPanels || setInternalPanels

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100
      setLeftWidth(Math.min(Math.max(newWidth, 25), 50))
    },
    [isResizing],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setLeftWidth(35)
  }, [])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (initialPanels && initialPanels.length > 0) {
      const savedSession = loadSession()
      const savedVideoUrls = initialVideoUrls || savedSession?.videoUrls || {}
      if (savedSession?.masterDescription) {
        setMasterDescription(
          savedSession.masterDescription.startsWith("SteelMotion automotive")
            ? DEFAULT_MASTER_DESCRIPTION
            : savedSession.masterDescription,
        )
      }
      if (savedSession?.videoConfig) {
        setVideoConfig(savedSession.videoConfig)
      }

      const newPanels: StoryboardPanelData[] = initialPanels.map((url, index) => ({
        id: Math.random().toString(36).substring(7),
        imageUrl: url,
        linkedImageUrl: initialLinkedPanelData?.[index],
        prompt: initialPrompts?.[index] || "",
        duration: (initialDurations?.[index] || 5) as 5 | 3 | 8,
        videoUrl: savedVideoUrls[index],
        model: initialLinkedPanelData?.[index]
          ? ("vidu:viduq3-pro" as VideoModel)
          : ("vidu:viduq3-pro" as VideoModel),
        isGenerating: false,
      }))
      setPanels(newPanels)
    }
  }, [initialPanels, initialLinkedPanelData, initialPrompts, initialDurations, initialVideoUrls])

  useEffect(() => {
    if (panels.length > 0 || masterDescription) {
      saveSession({
        masterDescription,
        videoConfig,
      })
    }
  }, [panels, masterDescription, videoConfig])

  useEffect(() => {
    if (panels.length > 0) {
      const videoUrls: Record<number, string> = {}
      panels.forEach((panel, index) => {
        if (panel.videoUrl) {
          videoUrls[index] = panel.videoUrl
        }
      })

      if (Object.keys(videoUrls).length > 0) {
        saveSession({ videoUrls })
      }
    }
  }, [panels])

  const updatePanel = (id: string, updates: Partial<StoryboardPanelData>) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const removePanel = (id: string) => {
    setPanels(panels.filter((p) => p.id !== id))
  }

  const generateVideo = async (id: string) => {
    const panel = panels.find((p) => p.id === id)
    if (!panel) return

    updatePanel(id, { isGenerating: true, error: undefined, generationStatus: "running" })

    try {
      const response = await fetch("/api/seq/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: panel.imageUrl,
          linkedImageUrl: panel.linkedImageUrl,
          prompt: panel.prompt,
          aspectRatio: videoConfig.aspectRatio,
          duration: panel.duration,
          useFastModel: videoConfig.useFastModel,
          model: panel.model || videoConfig.model,
          provider: videoConfig.provider,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = parseVideoGenerationResponse(await response.json())
      const videoUrl = result.url || result.data?.video?.url

      if (videoUrl) {
        updatePanel(id, {
          videoUrl,
          isGenerating: false,
          generation: result.generation,
          costLog: result.costLog,
          generationStatus: result.status || "succeeded",
        })
        toast.success("视频生成成功")
      } else if (result.status === "queued" || result.status === "running") {
        updatePanel(id, {
          isGenerating: false,
          generation: result.generation,
          costLog: result.costLog,
          generationStatus: result.status,
        })
        toast.info(`生成任务状态：${result.status}`)
      } else {
        throw new Error("返回结果里没有视频地址")
      }
    } catch (error: unknown) {
      console.error("Video generation failed:", error)
      updatePanel(id, {
        isGenerating: false,
        generationStatus: "failed",
        error: getErrorMessage(error),
      })
      toast.error("视频生成失败")
    }
  }

  const generateAll = async () => {
    const pendingPanels = panels.filter((p) => !p.videoUrl && !p.isGenerating && p.prompt.trim().length > 0)

    if (pendingPanels.length === 0) {
      toast.info("没有可生成的分镜，请先确认 prompt")
      return
    }

    toast.info(`开始生成 ${pendingPanels.length} 个分镜...`)

    await Promise.all(pendingPanels.map((p) => generateVideo(p.id)))
  }

  if (panels.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center bg-card">
        <div className="h-12 w-12 rounded-full flex items-center justify-center mb-4 bg-muted">
          <Layers className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">还没有分镜</h3>
        <p className="text-xs text-muted-foreground max-w-xs mb-4">
          先添加图片，再生成对应的视频片段。
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative flex w-full h-full overflow-hidden"
      style={{ userSelect: isResizing ? "none" : "auto" }}
    >
      {/* Left Panel - Configuration */}
      <div className="flex flex-col overflow-hidden bg-card" style={{ width: `${leftWidth}%`, minWidth: "280px" }}>
        <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">视频分镜</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{panels.length} 个分镜</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Info message if no prompts - card style */}
          {panels.length > 0 && panels.every((p) => !p.prompt) && (
            <div className="text-xs p-3 flex items-start gap-2 rounded-lg bg-muted text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground mb-1">分镜已就绪</p>
                <p>
                  你可以手动补充每个镜头的 motion prompt，也可以直接使用当前测试素材生成视频。
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              整体视频说明 / 风格上下文
            </label>
            <Textarea
              value={masterDescription}
              onChange={(e) => setMasterDescription(e.target.value)}
              placeholder="描述整体风格，例如：真实工业质感、冷色灯光、慢速推进、突出钢材表面反光和应用场景。"
              className="min-h-[100px] text-xs resize-none rounded-lg"
            />
          </div>

          <div className="rounded-lg p-4 bg-muted">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                视频生成配置
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-medium">画幅</label>
                <Select
                  value={videoConfig.aspectRatio}
                  onValueChange={(val) => setVideoConfig({ ...videoConfig, aspectRatio: val as "16:9" | "9:16" })}
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 横版</SelectItem>
                    <SelectItem value="9:16">9:16 竖版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-medium">速度</label>
                <Select
                  value={videoConfig.useFastModel ? "fast" : "standard"}
                  onValueChange={(val) => setVideoConfig({ ...videoConfig, useFastModel: val === "fast" })}
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">快速测试</SelectItem>
                    <SelectItem value="standard">质量优先</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              预计总时长：约 {panels.reduce((sum, p) => sum + (p.duration || 5), 0)} 秒
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs rounded-lg bg-transparent"
            onClick={() => {
              clearSession()
              window.location.reload()
            }}
          >
            重置本页
          </Button>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-border space-y-2">
          <Button
            size="sm"
            className="w-full h-10 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={generateAll}
          >
            <Wand2 className="mr-1.5 h-4 w-4" />
            生成全部视频
          </Button>
          {panels.length > 0 && panels.every((p) => p.videoUrl) && (
            <Button
              size="sm"
              className="w-full h-9 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={() => (window.location.href = "/timeline")}
            >
              <Film className="mr-1.5 h-3 w-3" />
              进入剪辑台
            </Button>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="relative w-1 cursor-col-resize flex-shrink-0 bg-border hover:bg-primary transition-colors"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />

      {/* Right Panel - Storyboard panels */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between border-b border-border">
          <span className="text-sm font-medium text-foreground">分镜列表</span>
          <span className="text-xs text-muted-foreground">
            已生成 {panels.filter((p) => p.videoUrl).length}/{panels.length}
          </span>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="grid min-w-[640px] grid-cols-1 gap-4 pb-4 xl:grid-cols-3">
            {panels.map((panel, index) => (
              <div key={panel.id} className="min-h-[480px]">
                <StoryboardPanel
                  panel={panel}
                  index={index}
                  masterDescription={masterDescription}
                  videoConfig={videoConfig}
                  onUpdate={updatePanel}
                  onRemove={removePanel}
                  onGenerate={generateVideo}
                />
              </div>
            ))}

            {panels.length < 6 && (
              <div className="min-h-[220px] rounded-lg border border-dashed border-border bg-card flex flex-col items-center justify-center text-center p-6 opacity-50 hover:opacity-100 transition-opacity cursor-help xl:min-h-[480px]">
                <p className="text-xs text-muted-foreground">可以继续添加图片作为新分镜</p>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="bg-muted/20" />
          <ScrollBar orientation="vertical" className="bg-muted/20" />
        </ScrollArea>
      </div>
    </div>
  )
}
