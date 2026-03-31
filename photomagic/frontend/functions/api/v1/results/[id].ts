// Cloudflare Pages Function: /api/v1/results/:id
// Serves stored result images from R2.

export interface Env {
  BUCKET: R2Bucket
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

async function findResultObject(bucket: R2Bucket, id: string) {
  const list = await bucket.list({ prefix: `results/${id}` })
  if (!list.objects.length) return null
  const key = list.objects[0].key
  return { key }
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders })

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = (params as any).id?.toString()
  if (!id) return new Response("Not Found", { status: 404, headers: corsHeaders })

  const found = await findResultObject(env.BUCKET, id)
  if (!found) return new Response("Not Found", { status: 404, headers: corsHeaders })

  const obj = await env.BUCKET.get(found.key)
  if (!obj) return new Response("Not Found", { status: 404, headers: corsHeaders })

  const headers = new Headers(corsHeaders)
  obj.writeHttpMetadata(headers)
  headers.set("etag", obj.httpEtag)
  headers.set("cache-control", "public, max-age=3600")

  return new Response(obj.body, { status: 200, headers })
}

export const onRequestHead: PagesFunction<Env> = async ({ env, params }) => {
  const id = (params as any).id?.toString()
  if (!id) return new Response(null, { status: 404, headers: corsHeaders })

  const found = await findResultObject(env.BUCKET, id)
  if (!found) return new Response(null, { status: 404, headers: corsHeaders })

  const obj = await env.BUCKET.head(found.key)
  if (!obj) return new Response(null, { status: 404, headers: corsHeaders })

  const headers = new Headers(corsHeaders)
  obj.writeHttpMetadata(headers)
  headers.set("etag", obj.httpEtag)
  headers.set("cache-control", "public, max-age=3600")
  return new Response(null, { status: 200, headers })
}
