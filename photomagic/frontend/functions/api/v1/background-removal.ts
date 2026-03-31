// Cloudflare Pages Function: /api/v1/background-removal
// Real implementation backed by remove.bg API and R2 result storage.

export interface Env {
  BUCKET: R2Bucket
  REMOVE_BG_API_KEY?: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

async function findUploadById(bucket: R2Bucket, fileId: string) {
  const list = await bucket.list({ prefix: `uploads/${fileId}` })
  if (!list.objects.length) return null
  const key = list.objects[0].key
  const obj = await bucket.get(key)
  return { key, obj }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  })
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.REMOVE_BG_API_KEY) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "CONFIG_ERROR",
            message: "REMOVE_BG_API_KEY is missing",
          },
        },
        500
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || !body.file_id) {
      return jsonResponse(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Missing file_id" },
        },
        400
      )
    }

    const found = await findUploadById(env.BUCKET, body.file_id)
    if (!found || !found.obj || !found.obj.body) {
      return jsonResponse(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Uploaded file not found" },
        },
        404
      )
    }

    const sourceBytes = await found.obj.arrayBuffer()
    const sourceMime = found.obj.httpMetadata?.contentType || "application/octet-stream"
    const originalName = found.obj.customMetadata?.originalName || `${body.file_id}.bin`

    const removeBgForm = new FormData()
    removeBgForm.append(
      "image_file",
      new Blob([sourceBytes], { type: sourceMime }),
      originalName
    )
    removeBgForm.append("size", "auto")

    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": env.REMOVE_BG_API_KEY,
      },
      body: removeBgForm,
    })

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text().catch(() => "")
      return jsonResponse(
        {
          success: false,
          error: {
            code: "REMOVE_BG_FAILED",
            message: `remove.bg request failed with status ${removeBgResponse.status}`,
            details: {
              status: removeBgResponse.status,
              body: errorText.slice(0, 1000),
            },
          },
        },
        502
      )
    }

    const outputBytes = await removeBgResponse.arrayBuffer()
    if (!outputBytes.byteLength) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "REMOVE_BG_EMPTY",
            message: "remove.bg returned empty image data",
          },
        },
        502
      )
    }

    const resultId = crypto.randomUUID()
    const resultKey = `results/${resultId}.png`

    await env.BUCKET.put(resultKey, outputBytes, {
      httpMetadata: {
        contentType: "image/png",
        contentDisposition: `inline; filename="${String(originalName).replace(/\.[^/.]+$/, "")}.png"`,
      },
      customMetadata: {
        source_file_id: body.file_id,
        operation: "background-removal",
        provider: "remove.bg",
      },
    })

    const now = new Date()
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const url = `/api/v1/results/${resultId}`

    return jsonResponse({
      success: true,
      data: {
        result_id: resultId,
        url,
        expires_at: expires.toISOString(),
        processing_time: 0,
        metadata: {
          parameters: body.parameters || {},
          provider: "remove.bg",
          format: "png",
        },
      },
    })
  } catch (err: any) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INTERNAL",
          message: err?.message || "Internal error",
          stack: err?.stack || null,
        },
      },
      500
    )
  }
}
