// Cloudflare Pages Function: /api/v1/files/:id
// Serves uploaded original files from R2.

export interface Env {
  BUCKET: R2Bucket
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

async function findObjectById(bucket: R2Bucket, prefix: string, id: string) {
  const list = await bucket.list({ prefix: `${prefix}/${id}` })
  if (!list.objects.length) return null
  const key = list.objects[0].key
  const obj = await bucket.get(key)
  return { key, obj }
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders })

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = (params as any).id?.toString()
  if (!id) return new Response("Not Found", { status: 404, headers: corsHeaders })

  const found = await findObjectById(env.BUCKET, "uploads", id)
  if (!found || !found.obj) return new Response("Not Found", { status: 404, headers: corsHeaders })

  const headers = new Headers(corsHeaders)
  found.obj.writeHttpMetadata(headers)
  headers.set("etag", found.obj.httpEtag)
  headers.set("cache-control", "public, max-age=3600")

  return new Response(found.obj.body, { status: 200, headers })
}

export const onRequestHead: PagesFunction<Env> = async ({ env, params }) => {
  const id = (params as any).id?.toString()
  if (!id) return new Response(null, { status: 404, headers: corsHeaders })

  const list = await env.BUCKET.list({ prefix: `uploads/${id}` })
  if (!list.objects.length) return new Response(null, { status: 404, headers: corsHeaders })

  const head = await env.BUCKET.head(list.objects[0].key)
  if (!head) return new Response(null, { status: 404, headers: corsHeaders })

  const headers = new Headers(corsHeaders)
  head.writeHttpMetadata(headers)
  headers.set("etag", head.httpEtag)
  headers.set("cache-control", "public, max-age=3600")
  return new Response(null, { status: 200, headers })
}
