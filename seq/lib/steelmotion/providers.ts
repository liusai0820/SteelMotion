import { fal } from "@fal-ai/client"

import type { CostLog, Generation, GenerationStatus, Provider, ProviderId } from "./types"

export interface VideoGenerationScene {
  id?: string
  projectId?: string
  prompt: string
  imageUrl?: string
  linkedImageUrl?: string
  duration: number
  aspectRatio: string
  resolution?: "540p" | "720p" | "1080p"
  audio?: boolean
}

export interface VideoProviderRuntime {
  id: ProviderId
  model: string
  useFastModel?: boolean
}

export interface GenerateVideoResult {
  url?: string
  taskId?: string
  status: GenerationStatus
  generation: Generation
  costLog: CostLog
  raw: unknown
}

export const VIDEO_PROVIDERS: Provider[] = [
  {
    id: "vidu",
    name: "Vidu",
    kind: "video",
    activeModelId: "viduq3-pro",
    status: "needs-api-key",
    models: [
      {
        id: "viduq3-pro",
        name: "Vidu Q3 Pro",
        description: "默认 Q3 模型，1080p 静音工业分镜测试",
        supportsTextToVideo: true,
        supportsImageToVideo: true,
        supportsFirstLastFrame: true,
        costHint: "credits",
      },
      {
        id: "viduq3-pro-fast",
        name: "Vidu Q3 Pro Fast",
        description: "快速工业分镜生成，适合图生视频初筛",
        supportsTextToVideo: false,
        supportsImageToVideo: true,
        supportsFirstLastFrame: true,
        costHint: "credits",
      },
      {
        id: "viduq3-turbo",
        name: "Vidu Q3 Turbo",
        description: "更快迭代，适合重试和初筛",
        supportsTextToVideo: true,
        supportsImageToVideo: true,
        supportsFirstLastFrame: false,
        costHint: "credits",
      },
    ],
  },
  {
    id: "fal",
    name: "fal.ai",
    kind: "video",
    activeModelId: "fal-ai/minimax-video",
    status: "needs-api-key",
    models: [
      {
        id: "fal-ai/minimax-video",
        name: "Minimax",
        description: "原 Seq 文生视频模型",
        supportsTextToVideo: true,
        supportsImageToVideo: false,
        supportsFirstLastFrame: false,
      },
      {
        id: "fal-ai/hunyuan-video",
        name: "Hunyuan",
        description: "原 Seq 文生视频高质量模型",
        supportsTextToVideo: true,
        supportsImageToVideo: false,
        supportsFirstLastFrame: false,
      },
      {
        id: "fal-ai/veo3.1/fast/image-to-video",
        name: "Veo 3.1 Fast",
        description: "原 Seq 图生视频快速模型",
        supportsTextToVideo: false,
        supportsImageToVideo: true,
        supportsFirstLastFrame: true,
      },
      {
        id: "fal-ai/wan-25-preview/image-to-video",
        name: "WAN 2.5",
        description: "原 Seq 图生视频 1080p 模型",
        supportsTextToVideo: false,
        supportsImageToVideo: true,
        supportsFirstLastFrame: false,
      },
    ],
  },
]

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function nowIso(): string {
  return new Date().toISOString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getNestedString(value: unknown, path: string[]): string | undefined {
  let current: unknown = value
  for (const key of path) {
    if (!isRecord(current)) return undefined
    current = current[key]
  }
  return typeof current === "string" && current.length > 0 ? current : undefined
}

function getFirstCreationUrl(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined
  const creations = value.creations
  if (!Array.isArray(creations)) return undefined
  const first = creations[0]
  return getNestedString(first, ["url"])
}

function extractVideoUrl(value: unknown): string | undefined {
  return (
    getNestedString(value, ["url"]) ||
    getNestedString(value, ["video_url"]) ||
    getNestedString(value, ["file_url"]) ||
    getNestedString(value, ["data", "video", "url"]) ||
    getNestedString(value, ["data", "url"]) ||
    getNestedString(value, ["video", "url"]) ||
    getNestedString(value, ["output", "url"]) ||
    getFirstCreationUrl(value)
  )
}

function extractTaskId(value: unknown): string | undefined {
  return (
    getNestedString(value, ["task_id"]) ||
    getNestedString(value, ["id"]) ||
    getNestedString(value, ["data", "task_id"]) ||
    getNestedString(value, ["data", "id"])
  )
}

function extractAmount(value: unknown): number {
  if (!isRecord(value)) return 0
  const direct = value.credits ?? value.cost ?? value.amount
  return typeof direct === "number" && Number.isFinite(direct) ? direct : 0
}

function mapTaskStatus(value: unknown, hasUrl: boolean): GenerationStatus {
  if (hasUrl) return "succeeded"
  const rawState = getNestedString(value, ["state"]) || getNestedString(value, ["status"]) || "queued"
  const state = rawState.toLowerCase()

  if (["success", "succeeded", "completed", "complete", "ready"].includes(state)) return "succeeded"
  if (["failed", "failure", "error", "cancelled", "canceled"].includes(state)) return "failed"
  if (["retrying", "retry"].includes(state)) return "retrying"
  if (["running", "processing", "generating", "started"].includes(state)) return "running"
  return "queued"
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (isRecord(error) && typeof error.message === "string") return error.message
  return "Video generation failed"
}

function getFalAspectRatio(aspectRatio: string): "auto" | "9:16" | "16:9" {
  if (aspectRatio === "9:16") return "9:16"
  if (aspectRatio === "16:9") return "16:9"
  return "auto"
}

function getDefaultViduModel(): string {
  return process.env.VIDU_DEFAULT_MODEL || "viduq3-pro"
}

function getDefaultViduResolution(): "540p" | "720p" | "1080p" {
  const value = process.env.VIDU_DEFAULT_RESOLUTION
  return value === "540p" || value === "720p" || value === "1080p" ? value : "1080p"
}

function getDefaultViduAudio(): boolean {
  return process.env.VIDU_DEFAULT_AUDIO === "true"
}

function createGenerationRecord({
  scene,
  provider,
  status,
  url,
  taskId,
  startedAt,
  durationMs,
  amount,
  error,
}: {
  scene: VideoGenerationScene
  provider: VideoProviderRuntime
  status: GenerationStatus
  url?: string
  taskId?: string
  startedAt: string
  durationMs: number
  amount: number
  error?: string
}): { generation: Generation; costLog: CostLog } {
  const completedAt = status === "queued" || status === "running" ? undefined : nowIso()
  const generationId = createId("gen")
  const costLogId = createId("cost")
  const failureCount = status === "failed" ? 1 : 0

  const generation: Generation = {
    id: generationId,
    projectId: scene.projectId,
    sceneId: scene.id,
    providerId: provider.id,
    model: provider.model,
    status,
    clipDecision: status === "failed" ? "retry" : "keep",
    prompt: scene.prompt,
    resultUrl: url,
    taskId,
    startedAt,
    completedAt,
    durationMs,
    failureCount,
    error,
    costLogId,
  }

  const costLog: CostLog = {
    id: costLogId,
    generationId,
    providerId: provider.id,
    model: provider.model,
    status,
    durationMs,
    amount,
    currency: provider.id === "vidu" ? "credits" : "unknown",
    failureCount,
    startedAt,
    completedAt,
  }

  return { generation, costLog }
}

async function callVidu(scene: VideoGenerationScene, provider: VideoProviderRuntime): Promise<unknown> {
  const apiKey = process.env.VIDU_API_KEY
  if (!apiKey) {
    throw new Error("VIDU_API_KEY is not configured")
  }

  const baseUrl = process.env.VIDU_BASE_URL || "https://api.vidu.cn/ent/v2"
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${apiKey}`,
  }

  const commonInput = {
    model: provider.model,
    prompt: scene.prompt.trim(),
    duration: Math.max(1, Math.round(scene.duration || 5)),
    resolution: scene.resolution || getDefaultViduResolution(),
    audio: scene.audio ?? getDefaultViduAudio(),
  }

  const endpoint = scene.imageUrl
    ? scene.linkedImageUrl
      ? "/start-end2video"
      : "/img2video"
    : "/text2video"

  const body =
    endpoint === "/text2video"
      ? { ...commonInput, aspect_ratio: scene.aspectRatio || "16:9" }
      : {
          ...commonInput,
          images: scene.linkedImageUrl ? [scene.imageUrl, scene.linkedImageUrl] : [scene.imageUrl],
        }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  const result: unknown = await response.json()
  if (!response.ok) {
    const message = getNestedString(result, ["message"]) || getNestedString(result, ["error"]) || response.statusText
    throw new Error(message)
  }

  return result
}

async function callFal(scene: VideoGenerationScene, provider: VideoProviderRuntime): Promise<unknown> {
  const key = process.env.FAL_KEY || process.env.FAL_FAL_KEY
  if (!key) {
    throw new Error("FAL_KEY is not configured")
  }

  fal.config({ credentials: key })

  if (!scene.imageUrl) {
    const falModel =
      provider.model === "fal-ai/hunyuan-video" ? "fal-ai/hunyuan-video" : "fal-ai/minimax-video"

    return fal.subscribe(falModel, {
      input: {
        prompt: scene.prompt.trim(),
        prompt_optimizer: true,
      },
      logs: true,
    })
  }

  if (scene.linkedImageUrl) {
    const falModel =
      provider.model === "fal-ai/wan/v2.2-a14b/image-to-video/turbo"
        ? "fal-ai/wan/v2.2-a14b/image-to-video/turbo"
        : provider.useFastModel
          ? "fal-ai/veo3.1/fast/first-last-frame-to-video"
          : "fal-ai/veo3.1/first-last-frame-to-video"

    return fal.subscribe(falModel, {
      input: {
        prompt: scene.prompt.trim(),
        first_frame_url: scene.imageUrl.trim(),
        last_frame_url: scene.linkedImageUrl.trim(),
        duration: "8s",
        aspect_ratio: getFalAspectRatio(scene.aspectRatio || "16:9"),
        resolution: "720p" as "720p" | "1080p",
        generate_audio: true,
      },
      logs: true,
    })
  }

  if (provider.model === "fal-ai/wan-25-preview/image-to-video") {
    return fal.subscribe("fal-ai/wan-25-preview/image-to-video", {
      input: {
        prompt: scene.prompt.trim(),
        image_url: scene.imageUrl.trim(),
        duration: scene.duration >= 8 ? "10" : "5",
        resolution: "1080p",
        negative_prompt: "low resolution, error, worst quality, low quality, defects",
        enable_prompt_expansion: true,
        enable_safety_checker: true,
      },
      logs: true,
    })
  }

  const falModel = provider.useFastModel ? "fal-ai/veo3.1/fast/image-to-video" : "fal-ai/veo3.1/image-to-video"

  return fal.subscribe(falModel, {
    input: {
      prompt: scene.prompt.trim(),
      image_url: scene.imageUrl.trim(),
      duration: "8s",
      aspect_ratio: (scene.aspectRatio || "16:9") as "16:9" | "9:16",
    },
    logs: true,
  })
}

export function splitProviderModel(model?: string, providerId?: string): VideoProviderRuntime {
  if (model?.startsWith("vidu:")) {
    return { id: "vidu", model: model.replace("vidu:", "") }
  }

  if (model?.startsWith("fal:")) {
    return { id: "fal", model: model.replace("fal:", "") }
  }

  if (providerId === "fal") {
    return { id: "fal", model: model || "fal-ai/minimax-video" }
  }

  return { id: "vidu", model: model || getDefaultViduModel() }
}

export async function generateVideo(
  scene: VideoGenerationScene,
  provider: VideoProviderRuntime,
): Promise<GenerateVideoResult> {
  const startedAt = nowIso()
  const startedMs = Date.now()

  try {
    const raw = provider.id === "vidu" ? await callVidu(scene, provider) : await callFal(scene, provider)
    const url = extractVideoUrl(raw)
    const taskId = extractTaskId(raw)
    const status = mapTaskStatus(raw, !!url)
    const durationMs = Date.now() - startedMs
    const { generation, costLog } = createGenerationRecord({
      scene,
      provider,
      status,
      url,
      taskId,
      startedAt,
      durationMs,
      amount: extractAmount(raw),
    })

    return { url, taskId, status, generation, costLog, raw }
  } catch (error: unknown) {
    const durationMs = Date.now() - startedMs
    const message = getErrorMessage(error)
    const { generation, costLog } = createGenerationRecord({
      scene,
      provider,
      status: "failed",
      startedAt,
      durationMs,
      amount: 0,
      error: message,
    })

    return { status: "failed", generation, costLog, raw: { error: message } }
  }
}
