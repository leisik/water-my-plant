"use server";

import { warsawLocalDateTimeToIso } from "@/lib/dates";
import {
  PHOTO_BUCKET,
  photoExtension,
  validatePhoto,
} from "@/lib/photos";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setFlashMessage } from "@/lib/flash";

async function redirectWithFlash(path: string, type: "success" | "error", message: string): Promise<never> {
  await setFlashMessage(type, message);
  redirect(path);
}

function validName(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  return name.length >= 1 && name.length <= 80 ? name : null;
}

async function uploadPhoto(file: File, userId: string, supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  const { data: authorized, error: authorizationError } = await supabase.rpc("is_authorized_user");
  if (authorizationError) {
    return {
      path: null,
      error: "Storage security is not configured. Apply the Supabase migration, then authorize your account as described in the README.",
    };
  }
  if (!authorized) {
    return {
      path: null,
      error: "This account is signed in but is not on the private allowlist. Add it to app_private.authorized_users using the SQL in the README.",
    };
  }
  const path = `${userId}/${crypto.randomUUID()}.${photoExtension(file)}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error?.message.includes("row-level security")) {
    return {
      path: null,
      error: "The plant-photos Storage policies are missing or outdated. Reapply the Storage policy section of the Supabase migration.",
    };
  }
  return error ? { path: null, error: error.message } : { path, error: null };
}

export async function createPlantAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = validName(formData);
  if (!name) return redirectWithFlash("/plants/new", "error", "Enter a plant name (up to 80 characters).");

  const file = formData.get("photo");
  let photoPath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const photoError = validatePhoto(file);
    if (photoError) await redirectWithFlash("/plants/new", "error", photoError);
    const upload = await uploadPhoto(file, user.id, supabase);
    if (upload.error) await redirectWithFlash("/plants/new", "error", `Photo upload failed: ${upload.error}`);
    photoPath = upload.path;
  }

  const { data, error } = await supabase
    .from("plants")
    .insert({ name, photo_path: photoPath, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (photoPath) await supabase.storage.from(PHOTO_BUCKET).remove([photoPath]);
    return redirectWithFlash("/plants/new", "error", error.message);
  }
  revalidatePath("/plants");
  await redirectWithFlash(`/plants/${data.id}`, "success", `${name} was added.`);
}

export async function updatePlantAction(plantId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = validName(formData);
  if (!name) return redirectWithFlash(`/plants/${plantId}/edit`, "error", "Enter a plant name (up to 80 characters).");

  const { data: plant } = await supabase
    .from("plants")
    .select("photo_path")
    .eq("id", plantId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!plant) redirect("/plants");

  const file = formData.get("photo");
  const removePhoto = formData.get("remove_photo") === "on";
  let nextPhotoPath = removePhoto ? null : plant.photo_path;
  let uploadedPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    const photoError = validatePhoto(file);
    if (photoError) await redirectWithFlash(`/plants/${plantId}/edit`, "error", photoError);
    const upload = await uploadPhoto(file, user.id, supabase);
    if (upload.error) await redirectWithFlash(`/plants/${plantId}/edit`, "error", `Photo upload failed: ${upload.error}`);
    uploadedPath = upload.path;
    nextPhotoPath = upload.path;
  }

  const { error } = await supabase
    .from("plants")
    .update({ name, photo_path: nextPhotoPath })
    .eq("id", plantId)
    .eq("user_id", user.id);
  if (error) {
    if (uploadedPath) await supabase.storage.from(PHOTO_BUCKET).remove([uploadedPath]);
    await redirectWithFlash(`/plants/${plantId}/edit`, "error", error.message);
  }

  if (plant.photo_path && plant.photo_path !== nextPhotoPath) {
    await supabase.storage.from(PHOTO_BUCKET).remove([plant.photo_path]);
  }
  revalidatePath("/plants");
  revalidatePath(`/plants/${plantId}`);
  await redirectWithFlash(`/plants/${plantId}`, "success", "Plant details updated.");
}

export async function deletePlantAction(plantId: string) {
  const { supabase, user } = await requireUser();
  const { data: plant } = await supabase
    .from("plants")
    .select("photo_path")
    .eq("id", plantId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!plant) redirect("/plants");

  const { error } = await supabase.from("plants").delete().eq("id", plantId).eq("user_id", user.id);
  if (error) await redirectWithFlash(`/plants/${plantId}/edit`, "error", error.message);
  if (plant.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([plant.photo_path]);
  revalidatePath("/plants");
  await redirectWithFlash("/plants", "success", "Plant and watering history deleted.");
}

export async function waterNowAction(plantId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("watering_events").insert({ plant_id: plantId });
  if (error) await redirectWithFlash(`/plants/${plantId}`, "error", error.message);
  revalidatePath("/plants");
  revalidatePath(`/plants/${plantId}`);
  await redirectWithFlash(`/plants/${plantId}`, "success", "Watering recorded.");
}

export async function addPastWateringAction(plantId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const localDateTime = String(formData.get("watered_at") ?? "");
  const wateredAt = warsawLocalDateTimeToIso(localDateTime);
  if (!wateredAt) {
    return redirectWithFlash(`/plants/${plantId}`, "error", "Choose a valid date and time.");
  }
  if (new Date(wateredAt).getTime() > Date.now() + 5 * 60_000) {
    await redirectWithFlash(`/plants/${plantId}`, "error", "A watering cannot be in the future.");
  }
  const { error } = await supabase
    .from("watering_events")
    .insert({ plant_id: plantId, watered_at: wateredAt });
  if (error) await redirectWithFlash(`/plants/${plantId}`, "error", error.message);
  revalidatePath("/plants");
  revalidatePath(`/plants/${plantId}`);
  await redirectWithFlash(`/plants/${plantId}`, "success", "Past watering added.");
}

export async function deleteWateringAction(plantId: string, eventId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("watering_events")
    .delete()
    .eq("id", eventId)
    .eq("plant_id", plantId);
  if (error) await redirectWithFlash(`/plants/${plantId}`, "error", error.message);
  revalidatePath("/plants");
  revalidatePath(`/plants/${plantId}`);
  await redirectWithFlash(`/plants/${plantId}`, "success", "Watering removed.");
}

export async function signOutAction() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
