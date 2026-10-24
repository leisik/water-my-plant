"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // Keep the server and first client render identical; localStorage is client-only.
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <label className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border bg-card px-2 text-foreground shadow-sm focus-within:ring-2 focus-within:ring-ring">
      <Sun aria-hidden="true" className="size-4 dark:hidden" />
      <Moon aria-hidden="true" className="hidden size-4 dark:block" />
      <span className="sr-only">Color theme</span>
      <select
        value={mounted ? theme ?? "system" : "system"}
        disabled={!mounted}
        onChange={(event) => setTheme(event.target.value)}
        className="h-full cursor-pointer rounded-lg bg-card py-1 pl-1 text-xs text-card-foreground focus:outline-none disabled:cursor-wait"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
