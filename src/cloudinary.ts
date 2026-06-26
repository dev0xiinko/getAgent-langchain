import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";
import { logger } from "./logger";

let configured = false;
function ensure() {
  if (configured) return;
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  configured = true;
}

/**
 * Recover the Cloudinary `public_id` from a delivery URL, e.g.
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/getagent/generated/abc.png
 *   → getagent/generated/abc
 * Returns null for non-Cloudinary URLs (remote/base64 images we never uploaded).
 */
export function publicIdFromUrl(url: string): string | null {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  if (!url.includes("res.cloudinary.com") || !m) return null;
  return m[1];
}

/** Upload a data: URL (or remote URL) to Cloudinary; returns the secure URL, or the input on failure. */
export async function uploadImageToCloudinary(dataUrl: string): Promise<string> {
  if (!config.cloudinary.cloudName) return dataUrl;
  try {
    ensure();
    const res = await cloudinary.uploader.upload(dataUrl, {
      folder: "getagent/generated",
      resource_type: "image",
    });
    return res.secure_url;
  } catch (e) {
    logger.warn("[cloudinary] upload failed", { message: (e as Error).message });
    return dataUrl; // keep base64/url so the user still gets the image
  }
}

/** Best-effort delete of previously-uploaded images by their delivery URLs. Never throws. */
export async function deleteImagesByUrl(urls: string[]): Promise<void> {
  if (!config.cloudinary.cloudName) return;
  const ids = urls.map(publicIdFromUrl).filter((id): id is string => Boolean(id));
  if (!ids.length) return;
  try {
    ensure();
    await Promise.all(ids.map((id) => cloudinary.uploader.destroy(id, { resource_type: "image" })));
    logger.info("[cloudinary] deleted images", { count: ids.length });
  } catch (e) {
    logger.warn("[cloudinary] delete failed", { message: (e as Error).message });
  }
}
