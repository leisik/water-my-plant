"use client";

import { useEffect } from "react";

export function ClearFlashCookie() {
  useEffect(() => {
    void fetch("/auth/flash", { method: "DELETE" });
  }, []);
  return null;
}
