// Cloudflare Pages Function: /api/v1/upload
// Handles multipart/form-data uploads.

export interface Env {
  // optional: add KV/R2 bindings later
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Expected multipart/form-data" } }),
        { status: 415, headers: { "content-type": "application/json", ...corsHeaders } }
      )
    }

    const form = await request.formData()

    // Frontend uses: formData.append('file', file)
    const file = form.get("file")
    const type = (form.get("type") || "").toString()
    const purpose = (form.get("purpose") || "").toString()

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "MISSING_FILE", message: "Missing form field: file" } }),
        { status: 400, headers: { "content-type": "application/json", ...corsHeaders } }
      )
    }

    // For MVP: return a data URL (works for small-ish images; not suitable for large production files)
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mime = file.type || "application/octet-stream"
    const dataUrl = `data:${mime};base64,${base64}`

    const fileId = crypto.randomUUID()
    const now = new Date()
    const expires = new Date(now.getTime() + 60 * 60 * 1000)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          file_id: fileId,
          url: dataUrl,
          expires_at: expires.toISOString(),
          metadata: {
            filename: file.name,
            size: file.size,
            mime_type: mime,
            dimensions: { width: 0, height: 0 },
          },
          type,
          purpose,
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
