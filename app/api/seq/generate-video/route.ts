import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { extname, resolve, sep } from "node:path"

import {
  generateVideo,
  getVideoTaskStatus,
  splitProviderModel,
  type VideoGenerationScene,
} from "@/seq/lib/steelmotion/providers"

type VideoResolution = "540p" | "720p" | "1080p"

interface GenerateVideoBody {
  prompt: string
  imageUrl?: string
  linkedImageUrl?: string
  duration: number
  aspectRatio: string
  useFastModel: boolean
  resolution: VideoResolution
  audio: boolean
  model?: string
  provider?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined
}

function parseResolution(value: unknown): VideoResolution {
  return value === "540p" || value === "720p" || value === "1080p" ? value : "1080p"
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (isRecord(error) && typeof error.message === "string") return error.message
  return "Video generation failed"
}

function parseRequestBody(body: unknown): GenerateVideoBody | null {
  if (!isRecord(body)) return null

  const prompt = asOptionalString(body.prompt)
  if (!prompt) return null

  const duration = typeof body.duration === "number" && Number.isFinite(body.duration) ? body.duration : 5
  const aspectRatio = asOptionalString(body.aspectRatio) || "16:9"
  const useFastModel = typeof body.useFastModel === "boolean" ? body.useFastModel : true
  const audio = typeof body.audio === "boolean" ? body.audio : false

  return {
    prompt,
    imageUrl: asOptionalString(body.imageUrl),
    linkedImageUrl: asOptionalString(body.linkedImageUrl),
    duration,
    aspectRatio,
    useFastModel,
    resolution: parseResolution(body.resolution),
    audio,
    model: asOptionalString(body.model),
    provider: asOptionalString(body.provider),
  }
}

function validateImageUrl(url: string | undefined, label: string): { error: string; details: string } | null {
  if (!url) return null

  const isValid = url.startsWith("https://") || url.startsWith("data:image/")
  if (isValid) return null

  return {
    error: `Invalid ${label} URL format`,
    details: "Supported formats: HTTPS URLs or data URIs (base64). Blob URLs are not supported.",
  }
}

function getImageMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  return "application/octet-stream"
}

async function localPublicImageToDataUri(url: string): Promise<string> {
  const cleanPath = decodeURIComponent(url.split("?")[0]?.split("#")[0] || url)
  const publicRoot = resolve(process.cwd(), "public")
  const filePath = resolve(publicRoot, cleanPath.replace(/^\/+/, ""))

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${sep}`)) {
    throw new Error("Local image path is outside public directory")
  }

  const image = await readFile(filePath)
  return `data:${getImageMimeType(filePath)};base64,${image.toString("base64")}`
}

async function normalizeImageUrl(url: string | undefined, label: string): Promise<string | undefined> {
  if (!url) return undefined
  if (url.startsWith("https://") || url.startsWith("data:image/")) return url
  if (url.startsWith("/")) return localPublicImageToDataUri(url)

  const imageUrlError = validateImageUrl(url, label)
  if (imageUrlError) throw new Error(imageUrlError.error)
  return url
}

function normalizeProviderError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("content checker") || lower.includes("flagged") || lower.includes("could not be processed")) {
    return "Content flagged by moderation: Please avoid copyrighted content, movie references, or trademarked characters in your prompts and images."
  }

  return message
}

export async function POST(request: Request) {
  try {
    const body = parseRequestBody(await request.json())

    if (!body) {
      return NextResponse.json({ error: "Prompt must be a non-empty string" }, { status: 400 })
    }

    let imageUrl: string | undefined
    let linkedImageUrl: string | undefined
    try {
      imageUrl = await normalizeImageUrl(body.imageUrl, "image")
      linkedImageUrl = await normalizeImageUrl(body.linkedImageUrl, "linked image")
    } catch (error: unknown) {
      return NextResponse.json(
        {
          error: getErrorMessage(error),
          details: "Supported formats: HTTPS URLs, data URIs (base64), or local files under /public.",
        },
        { status: 400 },
      )
    }

    const scene: VideoGenerationScene = {
      prompt: body.prompt,
      imageUrl,
      linkedImageUrl,
      duration: body.duration,
      aspectRatio: body.aspectRatio,
      resolution: body.resolution,
      audio: body.audio,
    }

    const provider = {
      ...splitProviderModel(body.model, body.provider),
      useFastModel: body.useFastModel,
    }
    const result = await generateVideo(scene, provider)

    if (result.status === "failed") {
      const message = normalizeProviderError(result.generation.error || "Video generation failed")
      return NextResponse.json(
        {
          error: message,
          status: result.status,
          generation: { ...result.generation, error: message },
          costLog: result.costLog,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      url: result.url,
      taskId: result.taskId,
      status: result.status,
      provider: result.generation.providerId,
      model: result.generation.model,
      generation: result.generation,
      costLog: result.costLog,
      data: result.url ? { video: { url: result.url } } : undefined,
      raw: result.raw,
    })
  } catch (error: unknown) {
    const message = normalizeProviderError(getErrorMessage(error))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    const provider = splitProviderModel(
      searchParams.get("model") || undefined,
      searchParams.get("provider") || undefined,
    )
    const result = await getVideoTaskStatus(taskId, provider)

    return NextResponse.json({
      url: result.url,
      taskId: result.taskId,
      status: result.status,
      data: result.url ? { video: { url: result.url } } : undefined,
      raw: result.raw,
    })
  } catch (error: unknown) {
    const message = normalizeProviderError(getErrorMessage(error))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
