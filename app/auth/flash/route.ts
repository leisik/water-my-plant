import { clearFlashMessage } from "@/lib/flash";
import { NextResponse } from "next/server";

export async function DELETE() {
  await clearFlashMessage();
  return new NextResponse(null, { status: 204 });
}
