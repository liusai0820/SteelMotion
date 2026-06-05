import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.VIDU_API_KEY

  return NextResponse.json({
    configured: !!apiKey,
    provider: "vidu",
  })
}
