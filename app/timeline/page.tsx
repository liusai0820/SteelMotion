import Editor from "@/seq/components/editor/app"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Timeline Editor - SteelMotion",
  description: "Professional magnetic timeline editor for steel industry video sequences",
}

// The demo parameter is handled inside TimelineEditor via useSearchParams
export default function TimelinePage() {
  return <Editor />
}
