// Cloudflare Pages Function: /api/v1/id-photo/tasks
// Forwards task creation and task status queries to backend async ID photo APIs.

export interface Env {
  ID_PHOTO_API_URL?: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json().catch(() => null)
    const backendBaseUrl = getBackendBaseUrl(env)
    const targetUrl = `${backendBaseUrl}/tasks`

    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body || {}),
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
