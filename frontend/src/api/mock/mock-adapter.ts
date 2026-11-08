import { JwtUtils } from "@/utils/jwt.utils.ts"
import { MOCK_ROUTES } from "@/api/mock/mock-handlers.ts"

const LATENCY_MS = 300

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function toResponse(status: number, body?: unknown): Response {
  if (body === undefined) return new Response(null, { status })
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function mockRequest(
  method: string,
  endpoint: string,
  body: unknown,
  token: string | null
): Promise<Response> {
  await wait(LATENCY_MS)

  const url = new URL(endpoint, "http://mock.local")
  const isAuthRoute = url.pathname.startsWith("/api/auth/")

  if (!isAuthRoute && !token) {
    return toResponse(401, {
      message: "Unauthorized",
      description: "Sign in first",
    })
  }

  const session = token ? JwtUtils.toSession(token) : null

  for (const route of MOCK_ROUTES) {
    if (route.method !== method) continue
    const match = url.pathname.match(route.pattern)
    if (!match) continue
    const reply = await route.handler({
      url,
      params: match.slice(1),
      body,
      userId: session?.userId ?? "",
      role: session?.role ?? "customer",
    })
    return toResponse(reply.status, reply.body)
  }

  return toResponse(404, {
    message: "Not found",
    description: `${method} ${url.pathname}`,
  })
}
