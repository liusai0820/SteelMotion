import type { ExportTemplate, Scene, SteelIndustryTemplateId } from "./types"

interface SteelIndustryTemplate {
  id: SteelIndustryTemplateId
  name: string
  material: string
  processing: string
  application: string
  component: string
  brandClose: string
  prompt: string
}

const STORYBOARD_FLOW = ["材料", "加工", "产品应用", "部件高亮", "品牌收束"] as const

export const STEEL_INDUSTRY_TEMPLATES: SteelIndustryTemplate[] = [
  {
    id: "automotive",
    name: "汽车",
    material: "高强度冷轧钢卷、镀锌钢板、先进高强钢",
    processing: "开卷、冲压、激光焊接、辊压成型和在线质检",
    application: "新能源车车身、底盘、电池包防护结构",
    component: "A 柱、防撞梁、门环、电池托盘的强度与轻量化",
    brandClose: "以更轻、更强、更稳定的材料能力收束到品牌标识",
    prompt:
      "面向汽车行业的高端钢材宣传片，节奏从钢卷原料进入自动化冲压与焊接产线，转到新能源车白车身装配，再突出 A 柱、防撞梁和电池托盘等关键部件，最后以品牌 Logo 和一句可信赖的工业口号收束。",
  },
  {
    id: "water-pipe",
    name: "水管",
    material: "耐腐蚀不锈钢带、镀锌管坯和精密焊管材料",
    processing: "制管、焊接、内外壁抛光、压力测试和防腐处理",
    application: "城市供水、消防管网、住宅饮用水系统",
    component: "焊缝、内壁洁净度、抗压结构和连接端口",
    brandClose: "以安全供水和长期耐用作为品牌承诺",
    prompt:
      "面向水管行业的钢材宣传片，先展示耐腐蚀钢带和管坯，再进入制管、焊接、抛光与压力测试流程，切到城市管网和住宅饮用水应用，突出焊缝、内壁和连接端口，最后以品牌 Logo、水流和安全耐用承诺收束。",
  },
  {
    id: "construction",
    name: "建筑",
    material: "热轧 H 型钢、钢筋、彩涂板和结构钢板",
    processing: "轧制、切割、钻孔、焊接、涂装和模块化预制",
    application: "高层建筑、桥梁、厂房和城市综合体",
    component: "梁柱节点、抗震连接、楼承板和外围护系统",
    brandClose: "以城市天际线和工程可靠性形成品牌记忆",
    prompt:
      "面向建筑行业的钢材宣传片，从钢坯与热轧型钢开始，进入切割、焊接、涂装和模块化预制，随后展示高层建筑、桥梁与厂房应用，重点高亮梁柱节点、抗震连接和楼承板，最后用城市天际线、Logo 和工程可靠性口号收束。",
  },
  {
    id: "home-appliance",
    name: "家电",
    material: "家电用彩涂板、镀锌板、PCM/VCM 面板",
    processing: "精密开平、冲压、覆膜、表面处理和颜色一致性检测",
    application: "冰箱、洗衣机、空调外壳和厨电面板",
    component: "外壳面板、折边、涂层耐磨性和色彩质感",
    brandClose: "以精致表面、稳定品质和品牌 Logo 收束",
    prompt:
      "面向家电行业的钢材宣传片，先展示彩涂板与镀锌板材料质感，再进入精密开平、冲压、覆膜和表面检测，切到冰箱、洗衣机、空调和厨电应用，高亮外壳面板、折边和涂层耐磨性，最后以整洁家庭场景、Logo 和品质口号收束。",
  },
  {
    id: "machinery",
    name: "工程机械",
    material: "耐磨钢板、高强结构钢和厚规格低合金钢",
    processing: "火焰切割、折弯、焊接、热处理和探伤检测",
    application: "挖掘机、起重机、矿山设备和港口机械",
    component: "铲斗、吊臂、底盘、回转平台和关键承力件",
    brandClose: "以重载工况和可靠交付形成品牌收束",
    prompt:
      "面向工程机械行业的钢材宣传片，从耐磨钢板和高强结构钢开始，进入切割、折弯、焊接、热处理与探伤检测，展示挖掘机、起重机和矿山设备的真实工况，重点高亮铲斗、吊臂、底盘和承力件，最后以品牌 Logo、重载场景和可靠交付承诺收束。",
  },
]

export const STEEL_STORYBOARD_PROMPT =
  "请按固定分镜链路生成 5 个镜头：材料 -> 加工 -> 产品应用 -> 部件高亮 -> 品牌收束。每个镜头包含画面描述、运镜、质感、字幕建议和预计时长。"

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "steel-brand-standard",
    name: "片头 + 片尾 + Logo + 水印 + 字幕",
    opener: "2 秒金属质感片头，钢卷或钢板细节进入主画面",
    closer: "3 秒品牌收束，Logo、口号和行业应用画面同屏",
    logo: { enabled: true, position: "top-right" },
    watermark: { enabled: true, text: "SteelMotion", opacity: 0.28 },
    subtitles: { enabled: true, style: "industrial" },
  },
  {
    id: "steel-client-clean",
    name: "客户交付干净版",
    opener: "1 秒黑底白字片头，仅保留项目名",
    closer: "2 秒 Logo 和联系方式预留位",
    logo: { enabled: true, position: "bottom-right" },
    watermark: { enabled: false, text: "", opacity: 0 },
    subtitles: { enabled: true, style: "minimal" },
  },
]

export function getSteelIndustryTemplate(templateId: SteelIndustryTemplateId): SteelIndustryTemplate {
  return STEEL_INDUSTRY_TEMPLATES.find((template) => template.id === templateId) || STEEL_INDUSTRY_TEMPLATES[0]
}

export function buildSteelStoryboardPrompt(templateId: SteelIndustryTemplateId, brandName = "客户品牌"): string {
  const template = getSteelIndustryTemplate(templateId)

  return [
    STEEL_STORYBOARD_PROMPT,
    `行业模板：${template.name}`,
    `品牌名：${brandName}`,
    `材料镜头：${template.material}`,
    `加工镜头：${template.processing}`,
    `产品应用：${template.application}`,
    `部件高亮：${template.component}`,
    `品牌收束：${template.brandClose}`,
    "整体风格：真实工业质感、冷暖对比、干净可信、避免夸张科幻感。",
  ].join("\n")
}

export function createSteelScenes(templateId: SteelIndustryTemplateId, projectId?: string): Scene[] {
  const template = getSteelIndustryTemplate(templateId)
  const prompts = [template.material, template.processing, template.application, template.component, template.brandClose]
  const titles = STORYBOARD_FLOW
  const stages = ["material", "processing", "product-application", "component-highlight", "brand-close"] as const

  return stages.map((stage, index) => ({
    id: `${templateId}-scene-${index + 1}`,
    projectId,
    order: index + 1,
    stage,
    title: titles[index],
    prompt: prompts[index],
    duration: index === stages.length - 1 ? 3 : 5,
    assetIds: [],
    industryTemplateId: templateId,
  }))
}
