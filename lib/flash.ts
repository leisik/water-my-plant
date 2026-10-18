import { cookies } from "next/headers";

const FLASH_COOKIE = "water-my-plant-flash";

export type FlashMessageData = {
  type: "success" | "error";
  message: string;
};

export async function setFlashMessage(type: FlashMessageData["type"], message: string) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_COOKIE, JSON.stringify({ type, message }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60,
  });
}

export async function readFlashMessage(): Promise<FlashMessageData | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(FLASH_COOKIE)?.value;
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<FlashMessageData>;
    if ((parsed.type === "success" || parsed.type === "error") && typeof parsed.message === "string") {
      return { type: parsed.type, message: parsed.message };
    }
  } catch {
    // Ignore malformed or stale flash cookies.
  }
  return null;
}

export async function clearFlashMessage() {
  const cookieStore = await cookies();
  cookieStore.delete(FLASH_COOKIE);
}
