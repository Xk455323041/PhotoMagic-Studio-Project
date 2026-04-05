// Cloudflare Pages Function: /api/v1/id-photo
// Compatibility wrapper: accepts legacy synchronous requests,
// but now creates an async backend task and returns task metadata immediately.

export interface Env {
  ID_PHOTO_API_URL?: string
  ID_PHOTO_API_TOKEN?: string
  ID_PHOTO_API_KEY?: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

type IDPhotoRequestBody = {
  file_id?: string
  parameters?: Record<string, unknown>
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
  const raw = sanitizeString(env.ID_PHOTO_API_URL)
  if (!raw) {
    throw new Error("ID_PHOTO_API_URL is not configured")
  }

  return raw.replace(/\/$/, "")
}

function buildAuthHeaders(env: Env): Record<string, string> {
  const headers: Record<string, string> = {}

  const token = sanitizeString(env.ID_PHOTO_API_TOKEN)
  const apiKey = sanitizeString(env.ID_PHOTO_API_KEY)

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (apiKey) {
    headers["X-API-Key"] = apiKey
  }

  return headers
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const requestId = crypto.randomUUID()

  try {
    const body = (await request.json().catch(() => null)) as IDPhotoRequestBody | null

    if (!body || !body.file_id) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing file_id",
          },
        },
        400,
        {
          "X-Debug-Request-Id": requestId,
        }
      )
    }

    const fileId = sanitizeString(body.file_id)
    if (!fileId) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid file_id",
          },
        },
        400,
        {
          "X-Debug-Request-Id": requestId,
        }
      )
    }

    const backendBaseUrl = getBackendBaseUrl(env)
    const targetUrl = `${backendBaseUrl}/tasks`

    const resp = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Pages-Debug-Request-Id": requestId,
        ...buildAuthHeaders(env),
      },
      body: JSON.stringify({
        file_id: fileId,
        parameters: body.parameters || {},
      }),
    })

    const text = await resp.text()

    return new Response(text, {
      status: resp.status,
      headers: {
        "content-type": "application/json",
        ...corsHeaders,
        "X-Debug-Request-Id": requestId,
        "X-Upstream-Status": String(resp.status),
        "X-Upstream-Url": targetUrl,
      },
    })
  } catch (err: any) {
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
