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

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
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

    const backendBaseUrl = getBackendBaseUrl(env)
    const targetUrl = `${backendBaseUrl}/tasks/${encodeURIComponent(taskId)}`

    const resp = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const text = await resp.text()
    return new Response(text, {
      status: resp.status,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (err: any) {
    return jsonResponse({
      success: false,
      error: {
        code: 'INTERNAL',
        message: err?.message || 'Internal error',
      },
    }, 500)
  }
}
