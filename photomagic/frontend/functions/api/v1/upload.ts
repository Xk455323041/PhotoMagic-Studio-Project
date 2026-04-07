// Cloudflare Pages Function: /api/v1/upload
// Proxies uploads to backend /api/v1/upload so uploaded files land in backend temp storage.

export interface Env {
  BACKEND_API_URL?: string
  BACKEND_API_TOKEN?: string
  BACKEND_API_KEY?: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp, X-File-Name, X-Upload-Type, X-Upload-Purpose",
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
      ...extraHeaders,
    },
  })
}

function sanitizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback
  return value.trim()
}

function getBackendBaseUrl(env: Env): string {
  const raw = sanitizeString(env.BACKEND_API_URL)
  if (!raw) {
    throw new Error("BACKEND_API_URL is not configured")
  }

  return raw.replace(/\/$/, "")
}

function buildAuthHeaders(env: Env): Record<string, string> {
  const headers: Record<string, string> = {}

  const token = sanitizeString(env.BACKEND_API_TOKEN)
  const apiKey = sanitizeString(env.BACKEND_API_KEY)

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (apiKey) {
    headers["X-API-Key"] = apiKey
  }

  return headers
}

function maskHeaders(headers: Headers): Record<string, string> {
  const hidden = new Set(["authorization", "cookie", "x-api-key", "cf-access-jwt-assertion"])
  const result: Record<string, string> = {}
  for (const [key, value] of headers.entries()) {
    result[key] = hidden.has(key.toLowerCase()) ? "[redacted]" : value
  }
  return result
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const startedAt = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const backendBaseUrl = getBackendBaseUrl(env)
    const targetUrl = `${backendBaseUrl}/upload`
    const formData = await request.formData()

    const file = formData.get("file")
    const type = sanitizeString(formData.get("type"))
    const purpose = sanitizeString(formData.get("purpose"))

    if (!(file instanceof File)) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "MISSING_FILE",
            message: "Missing form field: file",
            details: {
              receivedType: file === null ? "null" : typeof file,
              formKeys: Array.from(formData.keys()),
            },
          },
        },
        400,
        {
          "X-Debug-Request-Id": requestId,
        }
      )
    }

    const outboundFormData = new FormData()
    outboundFormData.append("file", file, file.name)
    outboundFormData.append("type", type)
    outboundFormData.append("purpose", purpose)

    const outboundHeaders: Record<string, string> = {
      "Accept": "application/json",
      "X-Pages-Debug-Request-Id": requestId,
      ...buildAuthHeaders(env),
    }

    console.log("[pages:upload] request:start", {
      requestId,
      backendBaseUrl,
      targetUrl,
      method: request.method,
      url: request.url,
      headers: maskHeaders(request.headers),
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      type,
      purpose,
      cf: (request as Request & { cf?: unknown }).cf ?? null,
    })

    const resp = await fetch(targetUrl, {
      method: "POST",
      headers: outboundHeaders,
      body: outboundFormData,
    })

    const text = await resp.text()
    const durationMs = Date.now() - startedAt

    console.log("[pages:upload] request:upstream-response", {
      requestId,
      targetUrl,
      durationMs,
      requestHeaders: {
        ...outboundHeaders,
        Authorization: outboundHeaders.Authorization ? "[redacted]" : undefined,
        "X-API-Key": outboundHeaders["X-API-Key"] ? "[redacted]" : undefined,
      },
      responseStatus: resp.status,
      responseOk: resp.ok,
      responseHeaders: maskHeaders(resp.headers),
      responsePreview: text.slice(0, 2000),
    })

    return new Response(text, {
      status: resp.status,
      headers: {
        "content-type": resp.headers.get("content-type") || "application/json",
        ...corsHeaders,
        "X-Debug-Request-Id": requestId,
        "X-Upstream-Status": String(resp.status),
        "X-Upstream-Url": targetUrl,
      },
    })
  } catch (err: any) {
    const durationMs = Date.now() - startedAt

    console.error("[pages:upload] request:error", {
      requestId,
      durationMs,
      message: err?.message || "Internal error",
      stack: err?.stack || null,
      cause: err?.cause ? String(err.cause) : null,
    })

    return jsonResponse(
      {
        success: false,
        error: {
          code: "INTERNAL",
          message: err?.message || "Internal error",
        },
      },
      500,
      {
        "X-Debug-Request-Id": requestId,
      }
    )
  }
}
