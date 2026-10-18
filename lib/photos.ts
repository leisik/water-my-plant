import type { SupabaseClient } from "@supabase/supabase-js";

export const PHOTO_BUCKET = "plant-photos";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function createPhotoUrl(supabase: SupabaseClient, path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

export function validatePhoto(file: File) {
  if (file.size === 0) return null;
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_PHOTO_BYTES) return "The photo must be 5 MB or smaller.";
  return null;
}

export function photoExtension(file: File) {
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
}
