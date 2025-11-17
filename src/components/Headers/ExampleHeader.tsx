"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";

export function ExampleHeader() {
  const { theme, setTheme, systemTheme } = useTheme();

  const current = theme === "system" ? systemTheme : theme;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full backdrop-blur-md bg-background/60 border-b border-border z-50"
    >
      <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          🌗 Next UI Theme Demo
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme("light")}
            className={`p-2 rounded-full hover:bg-muted transition ${
              current === "light" ? "bg-muted" : ""
            }`}
          >
            <Sun size={18} />
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`p-2 rounded-full hover:bg-muted transition ${
              current === "dark" ? "bg-muted" : ""
            }`}
          >
            <Moon size={18} />
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`p-2 rounded-full hover:bg-muted transition ${
              theme === "system" ? "bg-muted" : ""
            }`}
          >
            <Monitor size={18} />
          </button>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Radix UI Switch */}
          <label className="flex items-center gap-2 text-sm">
            <span>Dark</span>
            <Switch.Root
              checked={current === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              className="w-[42px] h-[25px] bg-muted rounded-full relative data-[state=checked]:bg-primary transition-colors"
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-background rounded-full shadow transform transition-transform duration-200 translate-x-0 data-[state=checked]:translate-x-[17px]" />
            </Switch.Root>
          </label>
        </div>
      </div>
    </motion.header>
  );
}
