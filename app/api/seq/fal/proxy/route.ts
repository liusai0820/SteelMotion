import { createRouteHandler } from "@fal-ai/server-proxy/nextjs"

const route = createRouteHandler()

export const GET = route.GET
export const POST = route.POST
export const PUT = route.PUT
