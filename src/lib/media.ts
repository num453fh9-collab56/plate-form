"use client";

/* ==========================================================================
   APEX · MEDIA HELPERS
   Browser-only helpers for turning uploaded / recorded files into persisted
   data URLs, plus the storage guards that keep LocalStorage from overflowing.
   ========================================================================== */

export const MAX_AVATAR_SOURCE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 6 * 1024 * 1024;
export const MAX_RECORDING_SECONDS = 30;

export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return dataUrl.length;
  const base64 = dataUrl.slice(comma + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image-failed"));
    image.src = src;
  });
}

/* Centre-crop to a square and downscale — keeps avatars tiny in LocalStorage. */
export async function resizeImageToSquare(
  file: File,
  size = 320,
  quality = 0.85,
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  if (typeof document === "undefined") return dataUrl;
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;

  const side = Math.min(image.width, image.height);
  const sx = (image.width - side) / 2;
  const sy = (image.height - side) / 2;
  context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", quality);
}

export function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const named = error as { name?: string; code?: number };
  return (
    named.name === "QuotaExceededError" ||
    named.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    named.code === 22 ||
    named.code === 1014
  );
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}
