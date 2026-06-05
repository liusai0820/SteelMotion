import { NextResponse } from "next/server"

import { generateVideo, splitProviderModel, type VideoGenerationScene } from "@/seq/lib/steelmotion/providers"

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

    const imageUrlError = validateImageUrl(body.imageUrl, "image")
    if (imageUrlError) {
      return NextResponse.json(imageUrlError, { status: 400 })
    }

    const linkedImageUrlError = validateImageUrl(body.linkedImageUrl, "linked image")
    if (linkedImageUrlError) {
      return NextResponse.json(linkedImageUrlError, { status: 400 })
    }

    const scene: VideoGenerationScene = {
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      linkedImageUrl: body.linkedImageUrl,
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
