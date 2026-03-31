// Cloudflare Pages Function: /api/v1/upload
// Handles multipart/form-data uploads and stores original files in R2.

export interface Env {
  BUCKET: R2Bucket
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp",
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  })
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
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const bucket = env.BUCKET as unknown as { put?: Function }

    if (!bucket || typeof bucket.put !== "function") {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "CONFIG_ERROR",
            message: 'BUCKET binding is missing or invalid',
            details: getBucketDiagnostics(env.BUCKET),
          },
        },
        500
      )
    }

    const contentType = request.headers.get("content-type") || ""
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "Expected multipart/form-data",
            details: { contentType },
          },
        },
        415
      )
    }

    let form: FormData
    try {
      form = await request.formData()
    } catch (err: any) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "FORMDATA_PARSE_FAILED",
            message: err?.message || "Failed to parse multipart form data",
            details: {
              contentType,
              contentLength: request.headers.get("content-length"),
              userAgent: request.headers.get("user-agent"),
            },
          },
        },
        400
      )
    }

    const file = form.get("file")
    const type = (form.get("type") || "").toString()
    const purpose = (form.get("purpose") || "").toString()

    if (!(file instanceof File)) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "MISSING_FILE",
            message: "Missing form field: file",
            details: {
              receivedType: file === null ? "null" : typeof file,
              formKeys: Array.from(form.keys()),
            },
          },
        },
        400
      )
    }

    const fileId = crypto.randomUUID()
    const mime = file.type || "application/octet-stream"
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin"
    const key = `uploads/${fileId}.${extension}`

    let body: ArrayBuffer
    try {
      body = await file.arrayBuffer()
    } catch (err: any) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "FILE_READ_FAILED",
            message: err?.message || "Failed to read uploaded file",
            details: {
              name: file.name,
              size: file.size,
              type: mime,
            },
          },
        },
        500
      )
    }

    try {
      await env.BUCKET.put(key, body, {
        httpMetadata: {
          contentType: mime,
          contentDisposition: `inline; filename="${file.name.replace(/"/g, "")}"`,
        },
        customMetadata: {
          originalName: file.name,
          type,
          purpose,
        },
      })
    } catch (err: any) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "R2_PUT_FAILED",
            message: err?.message || "Failed to store file in R2",
            details: {
              key,
              name: file.name,
              size: file.size,
              type: mime,
            },
          },
        },
        500
      )
    }

    const now = new Date()
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const url = `/api/v1/files/${fileId}`

    return jsonResponse({
      success: true,
      data: {
        file_id: fileId,
        url,
        expires_at: expires.toISOString(),
        metadata: {
          filename: file.name,
          size: file.size,
          mime_type: mime,
          dimensions: { width: 0, height: 0 },
        },
        storage: {
          provider: "r2",
          key,
        },
        type,
        purpose,
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
