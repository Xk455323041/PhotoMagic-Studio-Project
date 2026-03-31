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

function getBucketDiagnostics(bucket: unknown) {
  const anyBucket = bucket as any
  return {
    hasBucket: !!bucket,
    bucketType: typeof bucket,
    hasPut: typeof anyBucket?.put,
    hasGet: typeof anyBucket?.get,
    hasHead: typeof anyBucket?.head,
    hasList: typeof anyBucket?.list,
    ctorName: anyBucket?.constructor?.name || null,
    ownKeys: bucket ? Object.keys(anyBucket).slice(0, 20) : [],
    timestamp: new Date().toISOString(),
  }
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers })

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return new Response(
    JSON.stringify({
      success: true,
      data: getBucketDiagnostics(env.BUCKET),
    }),
    { status: 200, headers }
  )
}
