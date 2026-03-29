// Cloudflare Pages Function: /api/v1/background-removal
// Temporary R2-backed implementation: copies uploaded original to result storage
// so preview/download work. Real background removal can be plugged in later.

export interface Env {
  BUCKET: R2Bucket
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

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.file_id) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "BAD_REQUEST", message: "Missing file_id" } }),
        { status: 400, headers: { "content-type": "application/json", ...corsHeaders } }
      )
    }

    const found = await findUploadById(env.BUCKET, body.file_id)
    if (!found || !found.obj) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Uploaded file not found" } }),
        { status: 404, headers: { "content-type": "application/json", ...corsHeaders } }
      )
    }

    const resultId = crypto.randomUUID()
    const sourceKey = found.key
    const resultExt = sourceKey.includes(".") ? sourceKey.split(".").pop() : "bin"
    const resultKey = `results/${resultId}.${resultExt}`

    await env.BUCKET.put(resultKey, found.obj.body, {
      httpMetadata: {
        contentType: found.obj.httpMetadata?.contentType || "application/octet-stream",
        contentDisposition: found.obj.httpMetadata?.contentDisposition || undefined,
      },
      customMetadata: {
        source_file_id: body.file_id,
        operation: "background-removal-stub",
      },
    })

    const now = new Date()
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const url = `/api/v1/results/${resultId}`

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          result_id: resultId,
          url,
          expires_at: expires.toISOString(),
          processing_time: 0,
          metadata: {
            parameters: body.parameters || {},
            note: "Temporary implementation: preview/download available, real background removal not yet applied",
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json", ...corsHeaders } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "INTERNAL", message: err?.message || "Internal error" } }),
      { status: 500, headers: { "content-type": "application/json", ...corsHeaders } }
    )
  }
}
