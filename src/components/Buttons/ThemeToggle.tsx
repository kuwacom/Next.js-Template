"use client";
import { MoonIcon, SunIcon } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      className={clsx(
        "rounded-md p-2 transition-colors",
        isDark
          ? "bg-secondary text-secondary-foreground hover:bg-accent"
          : "bg-muted text-foreground hover:bg-accent"
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
