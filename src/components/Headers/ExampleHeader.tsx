"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { useSyncExternalStore } from "react";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ExampleHeader() {
  const tNav = useTranslations("nav");
  const tSite = useTranslations("site");
  const tTheme = useTranslations("theme");
  const { theme, setTheme, systemTheme } = useTheme();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const current = theme === "system" ? systemTheme : theme;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full backdrop-blur-md bg-background/60 border-b border-border z-50"
    >
      <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            🌗 {tSite("title")}
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {[
              { href: "/", label: tNav("home") },
              { href: "/docs", label: tNav("docs") },
              { href: "/forms", label: tNav("forms") },
              { href: "/swr", label: tNav("swr") },
            ].map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />

          {/* Light */}
          <button
            onClick={() => mounted && setTheme("light")}
            className={`p-2 rounded-full hover:bg-muted transition ${
              mounted && current === "light" ? "bg-muted" : ""
            }`}
            aria-label={tTheme("light")}
          >
            <Sun size={18} />
          </button>

          {/* Dark */}
          <button
            onClick={() => mounted && setTheme("dark")}
            className={`p-2 rounded-full hover:bg-muted transition ${
              mounted && current === "dark" ? "bg-muted" : ""
            }`}
            aria-label={tTheme("dark")}
          >
            <Moon size={18} />
          </button>

          {/* System */}
          <button
            onClick={() => mounted && setTheme("system")}
            className={`p-2 rounded-full hover:bg-muted transition ${
              mounted && theme === "system" ? "bg-muted" : ""
            }`}
            aria-label={tTheme("system")}
          >
            <Monitor size={18} />
          </button>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Radix Switch with hydration-safe guard */}
          <label className="flex items-center gap-2 text-sm">
            <span>{tTheme("switch")}</span>

            {mounted && (
              <Switch.Root
                checked={current === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                className="w-[42px] h-[25px] bg-muted rounded-full relative data-[state=checked]:bg-primary transition-colors"
              >
                <Switch.Thumb className="block w-[21px] h-[21px] bg-background rounded-full shadow transform transition-transform duration-200 translate-x-0 data-[state=checked]:translate-x-[17px]" />
              </Switch.Root>
            )}
          </label>
        </div>
      </div>
    </motion.header>
  );
}
