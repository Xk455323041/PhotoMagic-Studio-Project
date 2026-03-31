// Cloudflare Pages Function: /api/v1/upload
// Supports raw binary uploads (preferred) and multipart/form-data fallback.

export interface Env {
  BUCKET: R2Bucket
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Timestamp, X-File-Name, X-Upload-Type, X-Upload-Purpose",
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

function sanitizeFilename(name: string) {
  return name.replace(/[\r\n"]/g, "").trim() || "upload.bin"
}

function getExtension(filename: string) {
  return filename.includes(".") ? filename.split(".").pop() || "bin" : "bin"
}

function buildSuccessResponse(fileId: string, key: string, fileName: string, mime: string, size: number, type: string, purpose: string) {
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
        filename: fileName,
        size,
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
            message: "BUCKET binding is missing or invalid",
            details: getBucketDiagnostics(env.BUCKET),
          },
        },
        500
      )
    }

    const contentType = request.headers.get("content-type") || "application/octet-stream"
    const normalizedContentType = contentType.toLowerCase()

    // Preferred path: raw binary upload.
    if (!normalizedContentType.includes("multipart/form-data")) {
      const url = new URL(request.url)
      const rawFileName = sanitizeFilename(
        url.searchParams.get("filename") || request.headers.get("x-file-name") || "upload.bin"
      )
      const uploadType = (
        url.searchParams.get("type") || request.headers.get("x-upload-type") || ""
      ).toString()
      const uploadPurpose = (
        url.searchParams.get("purpose") || request.headers.get("x-upload-purpose") || ""
      ).toString()
      const mime = contentType || "application/octet-stream"
      const extension = getExtension(rawFileName)
      const fileId = crypto.randomUUID()
      const key = `uploads/${fileId}.${extension}`

      let body: ArrayBuffer
      try {
        body = await request.arrayBuffer()
      } catch (err: any) {
        return jsonResponse(
          {
            success: false,
            error: {
              code: "RAW_BODY_READ_FAILED",
              message: err?.message || "Failed to read upload body",
              details: {
                contentType,
                contentLength: request.headers.get("content-length"),
                fileName: rawFileName,
              },
            },
          },
          400
        )
      }

      if (!body.byteLength) {
        return jsonResponse(
          {
            success: false,
            error: {
              code: "EMPTY_BODY",
              message: "Upload body is empty",
              details: {
                contentType,
                fileName: rawFileName,
              },
            },
          },
          400
        )
      }

      try {
        await env.BUCKET.put(key, body, {
          httpMetadata: {
            contentType: mime,
            contentDisposition: `inline; filename="${rawFileName}"`,
          },
          customMetadata: {
            originalName: rawFileName,
            type: uploadType,
            purpose: uploadPurpose,
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
                fileName: rawFileName,
                size: body.byteLength,
                type: mime,
              },
            },
          },
          500
        )
      }

      return buildSuccessResponse(fileId, key, rawFileName, mime, body.byteLength, uploadType, uploadPurpose)
    }

    // Fallback path: multipart/form-data.
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
    const safeName = sanitizeFilename(file.name)
    const mime = file.type || "application/octet-stream"
    const extension = getExtension(safeName)
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
              name: safeName,
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
          contentDisposition: `inline; filename="${safeName}"`,
        },
        customMetadata: {
          originalName: safeName,
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
              name: safeName,
              size: file.size,
              type: mime,
            },
          },
        },
        500
      )
    }

    return buildSuccessResponse(fileId, key, safeName, mime, file.size, type, purpose)
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
