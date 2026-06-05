import Editor from "@/seq/components/editor/app"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "剪辑台 - SteelMotion",
  description: "用于钢材行业视频片段筛选、编排和导出的时间线剪辑台。",
}

export default function TimelinePage() {
  return <Editor />
}
