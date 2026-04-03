// Cloudflare Pages Function: /api/v1/id-photo/tasks/:taskId
// Proxies task status requests to backend async ID photo APIs.

export interface Env {
  ID_PHOTO_API_URL?: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
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
    throw new Error('ID_PHOTO_API_URL is not configured')
  }

  return raw.replace(/\/$/, '').replace(/\/internal\/id-photo$/, '')
}

function maskHeaders(headers: Headers): Record<string, string> {
  const hidden = new Set(['authorization', 'cookie', 'x-api-key', 'cf-access-jwt-assertion'])
  const result: Record<string, string> = {}
  for (const [key, value] of headers.entries()) {
    result[key] = hidden.has(key.toLowerCase()) ? '[redacted]' : value
  }
  return result
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env, request }) => {
  const startedAt = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const taskId = sanitizeString(params.taskId)
    if (!taskId) {
      return jsonResponse({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing taskId',
        },
      }, 400)
    }

    const rawApiUrl = sanitizeString(env.ID_PHOTO_API_URL)
    const backendBaseUrl = getBackendBaseUrl(env)
    const targetUrl = `${backendBaseUrl}/tasks/${encodeURIComponent(taskId)}`
    const outboundHeaders = {
      'Accept': 'application/json',
      'X-Pages-Debug-Request-Id': requestId,
    }

    console.log('[pages:id-photo:task-detail] request:start', {
      requestId,
      rawApiUrl,
      backendBaseUrl,
      targetUrl,
      taskId,
      method: request.method,
      url: request.url,
      headers: maskHeaders(request.headers),
      cf: (request as Request & { cf?: unknown }).cf ?? null,
    })

    const resp = await fetch(targetUrl, {
      method: 'GET',
      headers: outboundHeaders,
    })

    const text = await resp.text()
    const durationMs = Date.now() - startedAt

    console.log('[pages:id-photo:task-detail] request:upstream-response', {
      requestId,
      taskId,
      targetUrl,
      durationMs,
      requestHeaders: outboundHeaders,
      responseStatus: resp.status,
      responseOk: resp.ok,
      responseHeaders: maskHeaders(resp.headers),
      responsePreview: text.slice(0, 2000),
    })

    return new Response(text, {
      status: resp.status,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (err: any) {
    const durationMs = Date.now() - startedAt

    console.error('[pages:id-photo:task-detail] request:error', {
      requestId,
      durationMs,
      message: err?.message || 'Internal error',
      stack: err?.stack || null,
      cause: err?.cause ? String(err.cause) : null,
    })

    return jsonResponse({
      success: false,
      error: {
        code: 'INTERNAL',
        message: err?.message || 'Internal error',
      },
    }, 500)
  }
}
