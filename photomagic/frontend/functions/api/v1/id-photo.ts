// Cloudflare Pages Function: /api/v1/id-photo
// Compatibility wrapper: accepts legacy synchronous requests,
// but now creates an async backend task and returns task metadata immediately.

export interface Env {
  ID_PHOTO_API_URL?: string
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
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json().catch(() => null)) as IDPhotoRequestBody | null

    if (!body || !body.file_id) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Missing file_id',
          },
        },
        400
      )
    }

    const fileId = sanitizeString(body.file_id)
    if (!fileId) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid file_id',
          },
        },
        400
      )
    }

    const backendBaseUrl = getBackendBaseUrl(env)
    const targetUrl = `${backendBaseUrl}/tasks`

    console.log('[pages:id-photo] forwarding legacy request to async task endpoint', {
      fileId,
      targetUrl,
      parameterKeys: body.parameters ? Object.keys(body.parameters) : [],
    })

    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
        'content-type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (err: any) {
    console.error('[pages:id-photo] request failed', {
      message: err?.message || 'Unknown error',
      stack: err?.stack || null,
    })

    return jsonResponse(
      {
        success: false,
        error: {
          code: 'INTERNAL',
          message: err?.message || 'Internal error',
        },
      },
      500
    )
  }
}
