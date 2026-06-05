import type { Metadata } from "next"
import { LandingPage } from "@/seq/components/landing-page/components/landing-page"

export const metadata: Metadata = {
  title: "SteelMotion - Steel Industry Storyboard to Video Studio",
  description:
    "Generate steel industry storyboard videos from material, processing, product application, component highlights, and brand close.",
}

export default function Home() {
  return <LandingPage />
}
