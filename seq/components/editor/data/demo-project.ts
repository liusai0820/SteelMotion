// Demo project data for loading sample content

import type { MediaItem, TimelineClip, StoryboardPanel } from "../types"

export const DEMO_MEDIA: MediaItem[] = [
  {
    id: "demo-video-1",
    url: "/cinematic-forest-scene.jpg",
    thumbnailUrl: "/forest-thumbnail.jpg",
    prompt: "High-strength steel coils entering an automotive stamping line",
    duration: 5,
    aspectRatio: "16:9",
    status: "ready",
    type: "video",
    resolution: { width: 1280, height: 720 },
  },
  {
    id: "demo-video-2",
    url: "/ocean-waves-crashing.jpg",
    thumbnailUrl: "/ocean-thumbnail.jpg",
    prompt: "Robotic welding and inspection for automotive steel components",
    duration: 6,
    aspectRatio: "16:9",
    status: "ready",
    type: "video",
    resolution: { width: 1280, height: 720 },
  },
  {
    id: "demo-video-3",
    url: "/city-skyline-sunset.png",
    thumbnailUrl: "/city-thumbnail.jpg",
    prompt: "Finished vehicle body structure highlighting crash beam and battery tray",
    duration: 4,
    aspectRatio: "16:9",
    status: "ready",
    type: "video",
    resolution: { width: 1280, height: 720 },
  },
]

export const DEMO_CLIPS: TimelineClip[] = [
  {
    id: "demo-clip-1",
    mediaId: "demo-video-1",
    trackId: "v1",
    start: 0,
    duration: 5,
    offset: 0,
    volume: 1,
    speed: 1,
  },
  {
    id: "demo-clip-2",
    mediaId: "demo-video-2",
    trackId: "v1",
    start: 5,
    duration: 6,
    offset: 0,
    volume: 1,
    speed: 1,
    transition: { type: "cross-dissolve", duration: 1 },
  },
  {
    id: "demo-clip-3",
    mediaId: "demo-video-3",
    trackId: "v1",
    start: 11,
    duration: 4,
    offset: 0,
    volume: 1,
    speed: 1,
  },
]

export const DEMO_STORYBOARD: StoryboardPanel[] = [
  {
    id: "demo-sb-1",
    prompt: "材料：高强度冷轧钢卷进入汽车钢材智能产线，金属纹理清晰，镜头低角度推进",
    status: "idle",
    type: "scene",
    duration: 5,
    imageUrl: "/forest-storyboard.jpg",
  },
  {
    id: "demo-sb-2",
    prompt: "加工：冲压、激光焊接和在线质检同步运行，机械臂节奏稳定，真实工业光线",
    status: "idle",
    type: "scene",
    duration: 6,
    imageUrl: "/ocean-storyboard.jpg",
  },
  {
    id: "demo-sb-3",
    prompt: "品牌收束：白车身关键部件高亮，Logo 与可靠交付口号收尾",
    status: "idle",
    type: "scene",
    duration: 4,
    imageUrl: "/city-storyboard.jpg",
  },
]

export const DEMO_MASTER_DESCRIPTION =
  "SteelMotion automotive template: material -> processing -> product application -> component highlight -> brand close."
