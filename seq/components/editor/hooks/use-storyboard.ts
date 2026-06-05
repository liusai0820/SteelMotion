"use client"

import type React from "react"

import { useState, useCallback } from "react"
import type { StoryboardPanel, MediaItem, VideoConfig } from "../types"
import { useToastContext } from "@/seq/components/ui/sonner"
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

interface UseStoryboardOptions {
  initialPanels?: StoryboardPanel[]
  videoConfig: VideoConfig
  onMediaAdd: (media: MediaItem) => void
}

interface UseStoryboardReturn {
  panels: StoryboardPanel[]
  setPanels: React.Dispatch<React.SetStateAction<StoryboardPanel[]>>
  masterDescription: string
  setMasterDescription: React.Dispatch<React.SetStateAction<string>>
  isEnhancingMaster: boolean
  addPanel: () => void
  updatePanel: (id: string, changes: Partial<StoryboardPanel>) => void
  deletePanel: (id: string) => void
  generateImage: (panelId: string, prompt: string) => Promise<void>
  generateVideo: (
    panelId: string,
    prompt: string,
    image1Base64?: string,
    image2Base64?: string,
    useFastModel?: boolean,
  ) => Promise<void>
  upscaleImage: (panelId: string, imageUrl: string, isLinkedImage?: boolean) => Promise<void>
  enhanceMasterDescription: () => Promise<void>
}

export function useStoryboard({ initialPanels, videoConfig, onMediaAdd }: UseStoryboardOptions): UseStoryboardReturn {
  const { toast } = useToastContext()

  const [panels, setPanels] = useState<StoryboardPanel[]>(initialPanels || [])
  const [masterDescription, setMasterDescription] = useState("") // Default to empty string instead of demo description
  const [isEnhancingMaster, setIsEnhancingMaster] = useState(false)

  const addPanel = useCallback(() => {
    setPanels((prev) => [...prev, { id: `sb-${Date.now()}`, prompt: "", status: "idle", type: "scene", duration: 5 }])
  }, [])

  const updatePanel = useCallback((id: string, changes: Partial<StoryboardPanel>) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)))
  }, [])

  const deletePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const generateImage = useCallback(
    async (panelId: string, prompt: string) => {
      if (!prompt.trim()) return
      updatePanel(panelId, { status: "generating-image", error: undefined })

      try {
        let apiAspectRatio = "landscape"
        if (videoConfig.aspectRatio === "9:16") apiAspectRatio = "portrait"
        else if (videoConfig.aspectRatio === "1:1") apiAspectRatio = "square"

        const formData = new FormData()
        formData.append("mode", "text-to-image")
        formData.append("prompt", prompt)
        formData.append("aspectRatio", apiAspectRatio)

        const response = await fetch("/api/seq/generate-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Image generation failed")
        }

        const result = await response.json()
        updatePanel(panelId, { imageUrl: result.url, status: "idle" })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Image generation failed"
        updatePanel(panelId, { status: "error", error: message })
      }
    },
    [videoConfig.aspectRatio, updatePanel],
  )

  const generateVideo = useCallback(
    async (panelId: string, prompt: string, image1Base64?: string, image2Base64?: string, useFastModel?: boolean) => {
      updatePanel(panelId, { status: "generating-video", error: undefined })
      const panel = panels.find((p) => p.id === panelId)

      try {
        const body = {
          prompt: prompt || "A smooth cinematic motion sequence",
          imageUrl: image1Base64 || panel?.imageUrl,
          linkedImageUrl: image2Base64 || panel?.linkedImageUrl,
          aspectRatio: videoConfig.aspectRatio,
          duration: panel?.duration || 5,
          useFastModel: useFastModel ?? videoConfig.useFastModel,
          model: videoConfig.model,
          provider: videoConfig.provider,
        }

        const response = await fetch("/api/seq/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Video generation failed")
        }

        const result = parseVideoGenerationResponse(await response.json())
        const videoUrl = result.url || result.data?.video?.url

        if (videoUrl) {
          const mediaId = `media-sb-${panelId}-${Date.now()}`
          const newMedia: MediaItem = {
            id: mediaId,
            url: videoUrl,
            prompt: prompt,
            duration: panel?.duration || 5,
            aspectRatio: videoConfig.aspectRatio,
            status: "ready",
            type: "video",
            resolution: { width: 1280, height: 720 },
            generation: result.generation,
            costLog: result.costLog,
          }
          onMediaAdd(newMedia)
          updatePanel(panelId, {
            videoUrl,
            status: "idle",
            mediaId,
            generation: result.generation,
            costLog: result.costLog,
            generationStatus: result.status || "succeeded",
          })
        } else if (result.status === "queued" || result.status === "running") {
          updatePanel(panelId, {
            status: "idle",
            generation: result.generation,
            costLog: result.costLog,
            generationStatus: result.status,
          })
        } else {
          throw new Error("No video URL in response")
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Video generation failed"
        updatePanel(panelId, { status: "error", error: message })
      }
    },
    [videoConfig, panels, updatePanel, onMediaAdd],
  )

  const upscaleImage = useCallback(
    async (panelId: string, imageUrl: string, isLinkedImage = false) => {
      if (!imageUrl) return
      updatePanel(panelId, { status: "enhancing", error: undefined })

      try {
        const response = await fetch("/api/seq/upscale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, scale: 2 }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upscale failed")
        }

        const result = await response.json()

        if (result.url) {
          if (isLinkedImage) {
            updatePanel(panelId, { linkedImageUrl: result.url, status: "idle" })
          } else {
            updatePanel(panelId, { imageUrl: result.url, status: "idle" })
          }
          toast.success("Image upscaled successfully!")
        } else {
          throw new Error("No upscaled URL in response")
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Upscale failed"
        updatePanel(panelId, { status: "error", error: message })
        toast.error("Failed to upscale image")
      }
    },
    [updatePanel, toast],
  )

  const enhanceMasterDescription = useCallback(async () => {
    if (!masterDescription.trim()) return
    setIsEnhancingMaster(true)

    try {
      const response = await fetch("/api/seq/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: masterDescription }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Enhancement failed")
      }

      const result = await response.json()
      if (result.enhancedPrompt) {
        setMasterDescription(result.enhancedPrompt)
        toast.success("Description enhanced!")
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to enhance description"
      toast.error(message)
    } finally {
      setIsEnhancingMaster(false)
    }
  }, [masterDescription, toast])

  return {
    panels,
    setPanels,
    masterDescription,
    setMasterDescription,
    isEnhancingMaster,
    addPanel,
    updatePanel,
    deletePanel,
    generateImage,
    generateVideo,
    upscaleImage,
    enhanceMasterDescription,
  }
}
