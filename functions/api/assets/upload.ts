import { json, requireAdmin, slugify, type PagesContext } from "../_shared";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function onRequestPost(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  if (!context.env.TOOL_ASSETS) return json({ error: "Asset storage is not configured" }, { status: 503 });

  const form = await context.request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "Upload an image file." }, { status: 400 });
  if (file.size <= 0) return json({ error: "Image file is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) return json({ error: "Image must be 4 MB or smaller." }, { status: 413 });

  const contentType = file.type || "application/octet-stream";
  const extension = ALLOWED_TYPES[contentType];
  if (!extension) return json({ error: "Use JPG, PNG, WebP, GIF, or SVG." }, { status: 400 });

  const baseName = slugify(String(form?.get("name") || file.name || "tool-image")) || "tool-image";
  const key = `${baseName}-${crypto.randomUUID()}.${extension}`;
  await context.env.TOOL_ASSETS.put(key, file.stream(), {
    httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { originalName: file.name || "upload", uploadedBy: "tools-submit" },
  });
  return json({ ok: true, key, url: `/api/assets/${encodeURIComponent(key)}`, contentType, size: file.size }, { status: 201 });
}
