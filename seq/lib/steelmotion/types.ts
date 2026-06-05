export type SteelIndustryTemplateId = "automotive" | "water-pipe" | "construction" | "home-appliance" | "machinery"

export type StoryboardStage = "material" | "processing" | "product-application" | "component-highlight" | "brand-close"

export type GenerationStatus = "queued" | "running" | "succeeded" | "failed" | "retrying"

export type ClipDecision = "keep" | "retry" | "discard"

export type ProviderId = "vidu" | "fal"

export type AssetType = "image" | "video" | "logo" | "watermark" | "subtitle" | "audio"

export interface Project {
  id: string
  name: string
  description?: string
  industryTemplateId?: SteelIndustryTemplateId
  assets: Asset[]
  scenes: Scene[]
  generations: Generation[]
  providers: Provider[]
  costLogs: CostLog[]
  exportTemplateId?: string
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: string
  projectId?: string
  type: AssetType
  name: string
  url?: string
  prompt?: string
  mimeType?: string
  duration?: number
  width?: number
  height?: number
  createdAt: string
}

export interface Scene {
  id: string
  projectId?: string
  order: number
  stage: StoryboardStage
  title: string
  prompt: string
  duration: number
  assetIds: string[]
  industryTemplateId?: SteelIndustryTemplateId
}

export interface Generation {
  id: string
  projectId?: string
  sceneId?: string
  providerId: ProviderId
  model: string
  status: GenerationStatus
  clipDecision: ClipDecision
  prompt: string
  resultUrl?: string
  taskId?: string
  startedAt: string
  completedAt?: string
  durationMs: number
  failureCount: number
  error?: string
  retryOfGenerationId?: string
  costLogId: string
}

export interface Provider {
  id: ProviderId
  name: string
  kind: "video"
  activeModelId: string
  models: ProviderModel[]
  status: "available" | "needs-api-key" | "disabled"
}

export interface ProviderModel {
  id: string
  name: string
  description: string
  supportsTextToVideo: boolean
  supportsImageToVideo: boolean
  supportsFirstLastFrame: boolean
  costHint?: string
}

export interface CostLog {
  id: string
  generationId: string
  providerId: ProviderId
  model: string
  status: GenerationStatus
  durationMs: number
  amount: number
  currency: "credits" | "USD" | "CNY" | "unknown"
  failureCount: number
  startedAt: string
  completedAt?: string
}

export interface ExportTemplate {
  id: string
  name: string
  opener: string
  closer: string
  logo: {
    enabled: boolean
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  }
  watermark: {
    enabled: boolean
    text: string
    opacity: number
  }
  subtitles: {
    enabled: boolean
    style: "industrial" | "minimal" | "broadcast"
  }
}
