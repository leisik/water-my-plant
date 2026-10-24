"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" storageKey="water-my-plant-theme" defaultTheme="system" enableSystem enableColorScheme disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
