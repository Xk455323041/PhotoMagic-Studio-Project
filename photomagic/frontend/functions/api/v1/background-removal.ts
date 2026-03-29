// Cloudflare Pages Function: /api/v1/background-removal
// MVP implementation: expects JSON { file_id, parameters }
// NOTE: This stub does NOT do real background removal. It returns the uploaded data URL if the client passes it.

export interface Env {}

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
    const body = await request.json().catch(() => null)
    if (!body || !body.file_id) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "BAD_REQUEST", message: "Missing file_id" } }),
        { status: 400, headers: { "content-type": "application/json", ...corsHeaders } }
      )
    }

    const resultId = crypto.randomUUID()
    const now = new Date()
    const expires = new Date(now.getTime() + 60 * 60 * 1000)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          result_id: resultId,
          // placeholder URL; in real impl this would be an R2 signed URL or stored asset
          url: body.url || "",
          expires_at: expires.toISOString(),
          processing_time: 0,
          metadata: {
            parameters: body.parameters || {},
            note: "MVP stub: background removal not implemented",
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
