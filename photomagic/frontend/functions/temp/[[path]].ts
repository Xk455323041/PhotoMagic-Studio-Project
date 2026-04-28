export interface Env {
  BACKEND_API_URL?: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range",
}

function textResponse(message: string, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  })
}

function getBackendBaseUrl(env: Env): string {
  const configured = typeof env.BACKEND_API_URL === "string" ? env.BACKEND_API_URL.trim() : ""
  const base = configured || "http://101.32.246.47:3002"
  return base.replace(/\/$/, "")
}

function applyCorsHeaders(headers: Headers) {
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value)
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  return proxyTempRequest(request, env, params)
}

export const onRequestHead: PagesFunction<Env> = async ({ request, env, params }) => {
  return proxyTempRequest(request, env, params)
}

async function proxyTempRequest(request: Request, env: Env, params: Record<string, string | string[]>) {
  const url = new URL(request.url)
  const rawPath = params.path
  const path = Array.isArray(rawPath) ? rawPath.join("/") : rawPath || ""

  if (!path || path.includes("..")) {
    return textResponse("Invalid filename", 400, corsHeaders)
  }

  const backendBaseUrl = getBackendBaseUrl(env)
  const backendUrl = `${backendBaseUrl}/temp/${path}${url.search}`

  try {
    const headers = new Headers(request.headers)
    headers.delete("host")
    headers.delete("cf-connecting-ip")
    headers.delete("cf-ray")
    headers.delete("cf-ipcountry")
    headers.delete("cf-visitor")
    headers.set("X-Forwarded-Proto", "https")

    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      redirect: "manual",
    })

    const responseHeaders = new Headers(response.headers)
    applyCorsHeaders(responseHeaders)
    responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    responseHeaders.set("Pragma", "no-cache")
    responseHeaders.set("Expires", "0")
    responseHeaders.set("X-Content-Type-Options", "nosniff")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    return textResponse(`Bad Gateway: ${error?.message || "Unknown error"}`, 502, corsHeaders)
  }
}
