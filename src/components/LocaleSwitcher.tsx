"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(nextLocale: AppLocale) {
    // 現在の pathname はそのまま使い、locale prefix だけ差し替えて遷移する
    // createNavigation の router が locale-aware な URL を組み立ててくれる
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      aria-label={t("label")}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 p-1"
    >
      {/* routing.locales をそのまま使うことで追加 locale にも追従しやすくする */}
      {routing.locales.map((nextLocale) => {
        const isActive = nextLocale === locale;

        return (
          <button
            key={nextLocale}
            type="button"
            onClick={() => handleLocaleChange(nextLocale)}
            disabled={isPending || isActive}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t(nextLocale)}
          </button>
        );
      })}
    </div>
  );
}
