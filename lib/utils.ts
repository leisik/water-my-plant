import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasEnvVars = Boolean(
  supabaseUrl?.startsWith("https://") &&
  supabaseUrl.includes(".supabase.co") &&
  supabaseKey &&
  !supabaseKey.startsWith("your-"),
);
