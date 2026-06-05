import type { CostLog, Generation, GenerationStatus } from "@/seq/lib/steelmotion/types"

export type VideoModel =
  | "vidu:viduq3-pro-fast"
  | "vidu:viduq3-pro"
  | "vidu:viduq3-turbo"
  | "fal:fal-ai/minimax-video"
  | "fal:fal-ai/hunyuan-video"
  | "fal:fal-ai/veo3.1/fast/image-to-video"
  | "fal:fal-ai/wan-25-preview/image-to-video"
  | "fal:fal-ai/wan/v2.2-a14b/image-to-video/turbo"

export interface StoryboardPanelData {
  id: string
  imageUrl: string
  linkedImageUrl?: string // If set, this panel uses first-last frame video generation
  prompt: string
  duration: 3 | 5 | 8
  videoUrl?: string
  isGenerating: boolean
  error?: string
  model?: VideoModel
  generation?: Generation
  costLog?: CostLog
  generationStatus?: GenerationStatus
}

export interface VideoConfig {
  aspectRatio: "16:9" | "9:16"
  useFastModel: boolean
  provider?: "vidu" | "fal"
  model?: VideoModel
  exportTemplateId?: string
}

export interface StoryboardState {
  panels: StoryboardPanelData[]
}
