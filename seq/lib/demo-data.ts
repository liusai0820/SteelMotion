export const DEMO_STORYBOARD = {
  masterImageUrl: "/placeholder.jpg",
  masterDescription:
    "SteelMotion automotive steel launch film: material -> processing -> product application -> component highlight -> brand close.",
  panelCount: 5,
  panels: [
    {
      imageUrl: "/placeholder.jpg",
      prompt: "材料：高强度冷轧钢卷在冷色工业灯光下展开，镜头贴近钢材纹理并缓慢推进",
      duration: 5 as const,
      aspectRatio: "16:9" as const,
    },
    {
      imageUrl: "/city-skyline-sunset.png",
      prompt: "加工：自动化冲压、激光焊接和在线质检连续运转，机械臂动作稳定精准",
      duration: 5 as const,
      aspectRatio: "16:9" as const,
    },
    {
      imageUrl: "/majestic-mountain-vista.png",
      prompt: "产品应用：新能源车白车身在装配线上成型，钢结构轮廓被柔和高光勾勒",
      duration: 5 as const,
      aspectRatio: "16:9" as const,
    },
    {
      imageUrl: "/cinematic-forest-scene.jpg",
      prompt: "部件高亮：A 柱、防撞梁和电池托盘依次发光标注，展示强度、轻量化和稳定性",
      duration: 5 as const,
      aspectRatio: "16:9" as const,
    },
    {
      imageUrl: "/og-image.png",
      prompt: "品牌收束：成品车驶出工厂，Logo、水印和字幕以干净工业风收尾",
      duration: 5 as const,
      aspectRatio: "16:9" as const,
    },
  ],
}

export const DEMO_TRANSITION_STORYBOARD = {
  transitionImageUrl: "/placeholder.jpg",
  description:
    "Create first-last-frame transitions between steel material close-ups, automated processing, product applications, component highlights, and brand close.",
  panelCount: 5,
  panels: [
    {
      imageUrl: "/placeholder.jpg",
      label: "Material",
      description: "High-strength steel coil close-up",
    },
    {
      imageUrl: "/city-skyline-sunset.png",
      label: "Processing",
      description: "Stamping and laser welding line",
    },
    {
      imageUrl: "/majestic-mountain-vista.png",
      label: "Application",
      description: "Automotive body-in-white application",
    },
    {
      imageUrl: "/cinematic-forest-scene.jpg",
      label: "Component",
      description: "Crash beam and battery tray highlight",
    },
    {
      imageUrl: "/og-image.png",
      label: "Brand",
      description: "Logo, watermark, subtitle, and closing frame",
    },
  ],
}

export const DEMO_FINAL_SEQUENCE = {
  masterDescription:
    "SteelMotion automotive steel template: high-strength material, automated processing, vehicle application, component highlight, and brand close.",
  videoConfig: {
    aspectRatio: "16:9" as const,
    useFastModel: true,
    provider: "vidu" as const,
    model: "vidu:viduq3-pro-fast" as const,
    exportTemplateId: "steel-brand-standard",
  },
  panels: [
    {
      imageUrl: "/placeholder.jpg",
      prompt: "材料：高强度冷轧钢卷进入智能产线，镜头低角度推进，突出金属质感和稳定供应能力。",
      duration: 5 as const,
      linkedImageUrl: undefined,
      videoUrl: "https://v3b.fal.media/files/b/0a84a235/Z9sIv_PFVXLU8uDcb9Hey_output.mp4",
    },
    {
      imageUrl: "/city-skyline-sunset.png",
      linkedImageUrl: "/majestic-mountain-vista.png",
      prompt: "加工：冲压、激光焊接和在线质检连续切换，转场到新能源车白车身应用。",
      duration: 5 as const,
      videoUrl: "https://v3b.fal.media/files/b/monkey/D_Pf7zR9bbiKaRT6twClJ.mp4",
    },
    {
      imageUrl: "/majestic-mountain-vista.png",
      prompt: "产品应用：白车身在装配线上成型，镜头展示车身结构、底盘和电池包防护区域。",
      duration: 5 as const,
      linkedImageUrl: undefined,
      videoUrl: "https://v3b.fal.media/files/b/elephant/l8BSTRj_g7f-pFOfx7siq_TPl6daj3.mp4",
    },
    {
      imageUrl: "/cinematic-forest-scene.jpg",
      prompt: "部件高亮：A 柱、防撞梁和电池托盘依次发光标注，字幕强调强度、轻量化和一致性。",
      duration: 5 as const,
      linkedImageUrl: undefined,
      videoUrl: "https://v3b.fal.media/files/b/panda/evoI_qve6jM04K-AeG4dd_TV3dmkaY.mp4",
    },
    {
      imageUrl: "/og-image.png",
      prompt: "品牌收束：工厂全景、成品车和品牌 Logo 同屏，水印与字幕以工业风干净收尾。",
      duration: 5 as const,
      linkedImageUrl: undefined,
      videoUrl: "https://v3b.fal.media/files/b/rabbit/iS5IFUBwrTgZCqEdTZJJo_output.mp4",
    },
  ],
}
