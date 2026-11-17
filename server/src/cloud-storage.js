import { createHash } from "node:crypto";

const config = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret)
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  return { cloudName, apiKey, apiSecret };
};

const signature = (params, secret) => {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(serialized + secret).digest("hex");
};

export function isCloudMediaUrl(url) {
  return typeof url === "string" && /^\/api\/files\/c_[a-f0-9]{36}\.png$/.test(url);
}

export function mediaPublicId(url) {
  if (!isCloudMediaUrl(url)) throw new Error("Invalid media locator");
  return `srps/media/${url.slice("/api/files/c_".length, -".png".length)}`;
}
export const CLOUDINARY_MEDIA_FOLDER = "ReportCard/Media";
export const CLOUDINARY_REPORT_FOLDER = "ReportCard/Reports";

export async function uploadAuthenticated({ bytes, resourceType, publicId, format, assetFolder }) {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { asset_folder: assetFolder, overwrite: "true", public_id: publicId, timestamp, type: "authenticated" };
  const form = new FormData();
  form.set("file", new Blob([bytes]), `asset.${format}`);
  for (const [key, value] of Object.entries(params)) form.set(key, String(value));
  form.set("api_key", apiKey);
  form.set("signature", signature(params, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`, { method: "POST", body: form });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Cloudinary upload failed (${response.status})`);
  return payload;
}

export async function moveAuthenticatedToFolder({ publicId, resourceType, assetFolder }) {
  const { cloudName, apiKey, apiSecret } = config();
  const auth = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
  const resourceUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/${resourceType}/authenticated/${encodeURI(publicId)}`;
  const currentResponse = await fetch(resourceUrl, { headers: { Authorization: auth } });
  const current = await currentResponse.json().catch(() => ({}));
  if (!currentResponse.ok) throw new Error(current?.error?.message || `Cloudinary asset lookup failed (${currentResponse.status})`);
  if (current.asset_folder === assetFolder) return false;
  const form = new FormData();
  form.set("asset_folder", assetFolder);
  const moved = await fetch(resourceUrl, {
    method: "POST",
    headers: { Authorization: auth },
    body: form,
  });
  const payload = await moved.json().catch(() => ({}));
  if (!moved.ok) throw new Error(payload?.error?.message || `Cloudinary folder move failed (${moved.status})`);
  return true;
}

export function privateDownloadUrl({ publicId, resourceType, format, attachment = false, ttlSeconds = 300 }) {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + Math.max(30, Math.min(3600, ttlSeconds));
  const params = {
    timestamp,
    public_id: publicId,
    format,
    type: "authenticated",
    expires_at: expiresAt,
    ...(attachment ? { attachment: "true" } : {}),
  };
  const url = new URL(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/download`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  url.searchParams.set("signature", signature(params, apiSecret));
  url.searchParams.set("api_key", apiKey);
  return url.toString();
}

export async function destroyAuthenticated({ publicId, resourceType = "image" }) {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: "true", public_id: publicId, timestamp, type: "authenticated" };
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.set(key, String(value));
  form.set("api_key", apiKey);
  form.set("signature", signature(params, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/destroy`, { method: "POST", body: form });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.result !== "ok") throw new Error(payload?.error?.message || "Cloudinary delete failed");
  return payload;
}
