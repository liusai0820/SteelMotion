import type { Metadata } from "next"
import { LandingPage } from "@/seq/components/landing-page/components/landing-page"

export const metadata: Metadata = {
  title: "SteelMotion - 钢材视频生成工作台",
  description: "从钢材行业模板生成分镜、视频片段和可导出的产品宣传片。",
}

export default function Home() {
  return <LandingPage />
}
