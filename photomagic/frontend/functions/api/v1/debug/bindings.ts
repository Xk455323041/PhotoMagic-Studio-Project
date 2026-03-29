// Cloudflare Pages Function: /api/v1/debug/bindings
// Simple runtime diagnostics for Pages bindings.

export interface Env {
  BUCKET?: R2Bucket
}

const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers })

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const hasBucket = !!env.BUCKET
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        hasBucket,
        bucketType: hasBucket ? typeof env.BUCKET : null,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers }
  )
}
