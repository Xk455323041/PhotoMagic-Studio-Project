// Cloudflare Pages Function: /api/v1/debug/echo-upload
// Minimal POST body probe for Cloudflare Pages Functions.

const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp, X-File-Name, X-Upload-Type, X-Upload-Purpose",
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers })

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = await request.arrayBuffer()

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          size: body.byteLength,
          contentType: request.headers.get("content-type"),
          contentLength: request.headers.get("content-length"),
          fileName: request.headers.get("x-file-name"),
          uploadType: request.headers.get("x-upload-type"),
          uploadPurpose: request.headers.get("x-upload-purpose"),
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 200, headers }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "ECHO_UPLOAD_FAILED",
          message: err?.message || "Failed to read request body",
          stack: err?.stack || null,
        },
      }),
      { status: 500, headers }
    )
  }
}
