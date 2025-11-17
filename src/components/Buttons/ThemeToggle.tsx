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
        "rounded-md p-2 transition",
        isDark ? "bg-slate-800 text-white" : "bg-slate-200 text-black"
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
