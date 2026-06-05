import type { SteelIndustryTemplateId } from "./types"

export interface SteelMotionTestFrame {
  id: string
  title: string
  stage: string
  templateId: SteelIndustryTemplateId
  url: string
  prompt: string
}

export interface SteelMotionDemoPanel {
  id: string
  title: string
  imageUrl: string
  linkedImageUrl?: string
  prompt: string
}

export const STEELMOTION_TEST_FRAMES: SteelMotionTestFrame[] = [
  {
    id: "raw-steel-coil",
    title: "裸钢卷 / 高强钢卷",
    stage: "原材料",
    templateId: "automotive",
    url: "/test-images/raw-steel-coil.jpg",
    prompt:
      "以这张裸钢卷作为唯一输入图，生成真实工业质感的视频：钢卷被开卷、校平、落料，随后进入冲压和焊接流程，逐步成为新能源车电池托盘或防撞梁部件，最后安装到车身结构中并高亮其承力位置。不要出现字幕、不要配音、不要音乐，保持1080p横版。",
  },
  {
    id: "raw-steel-slabs",
    title: "裸钢板坯",
    stage: "原材料",
    templateId: "automotive",
    url: "/test-images/raw-steel-slabs.jpg",
    prompt:
      "以这张裸钢板坯作为唯一输入图，生成真实工业质感的视频：板坯被加热、热轧、冷却、切割成板材，再经过冲压和焊接成为汽车底盘横梁或车身加强件，最后装配到车身底部并用光线高亮结构位置。不要出现字幕、不要配音、不要音乐，保持1080p横版。",
  },
  {
    id: "raw-square-steel-bars",
    title: "裸钢方棒",
    stage: "原材料",
    templateId: "automotive",
    url: "/test-images/raw-square-steel-bars.jpg",
    prompt:
      "以这张裸钢方棒作为唯一输入图，生成真实工业质感的视频：方棒被切割、折弯、钻孔和焊接，逐步成为汽车座椅骨架支架、悬架连接件或车门防撞加强件，最后安装到对应车辆部位并高亮受力结构。不要出现字幕、不要配音、不要音乐，保持1080p横版。",
  },
]

export const STEELMOTION_DEMO_PANELS: SteelMotionDemoPanel[] = [
  {
    id: "coil-to-car-part",
    title: "钢卷变汽车承力部件",
    imageUrl: STEELMOTION_TEST_FRAMES[0].url,
    prompt:
      STEELMOTION_TEST_FRAMES[0].prompt,
  },
  {
    id: "slab-to-car-part",
    title: "板坯变底盘加强件",
    imageUrl: STEELMOTION_TEST_FRAMES[1].url,
    prompt:
      STEELMOTION_TEST_FRAMES[1].prompt,
  },
  {
    id: "bar-to-car-part",
    title: "棒料变汽车结构支架",
    imageUrl: STEELMOTION_TEST_FRAMES[2].url,
    prompt:
      STEELMOTION_TEST_FRAMES[2].prompt,
  },
]
