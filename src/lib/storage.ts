"use client";

import { getSupabase } from "./supabase";

/* ==========================================================================
   APEX · STORAGE
   Upload media to Supabase Storage. Files always go under a folder named
   after the user's id (`<bucket>/<userId>/<file>`), which is exactly what the
   storage RLS policies allow.
   ========================================================================== */

export type MediaBucket = "avatars" | "gig-media" | "portfolio" | "intro-videos";

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[mime] ?? mime.split("/")[1] ?? "bin";
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "application/octet-stream";
  if (header.includes(";base64")) {
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(body)], { type: mime });
}

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "file";
}

async function upload(
  bucket: MediaBucket,
  userId: string,
  blob: Blob,
  name: string,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const path = `${userId}/${Date.now()}-${safeName(name)}.${extFromMime(blob.type)}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { upsert: true, contentType: blob.type || undefined });
  if (error) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadBlob(
  bucket: MediaBucket,
  userId: string,
  blob: Blob,
  name = "file",
): Promise<string | null> {
  return upload(bucket, userId, blob, name);
}

export function uploadFile(
  bucket: MediaBucket,
  userId: string,
  file: File,
): Promise<string | null> {
  return upload(bucket, userId, file, file.name);
}

export function uploadDataUrl(
  bucket: MediaBucket,
  userId: string,
  dataUrl: string,
  name = "file",
): Promise<string | null> {
  return upload(bucket, userId, dataUrlToBlob(dataUrl), name);
}
