import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ExampleHeader } from "@/components/Headers/ExampleHeader";
import { HtmlLang } from "@/components/HtmlLang";
import SWRProvider from "@/components/providers/SWRProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { routing, isValidLocale } from "@/i18n/routing";

type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

// locale prefix ごとの静的ルートを先に列挙する
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "site" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Server Components で静的最適化を維持しつつ locale を固定する
  setRequestLocale(locale);

  return (
    // messages は request.ts で確定した値が自動で注入される
    <NextIntlClientProvider>
      {/* root layout では locale を受け取れないため html lang はここで同期する */}
      <HtmlLang />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SWRProvider>
          <ExampleHeader />
          <main className="mx-auto max-w-5xl px-6 pt-20">{children}</main>
        </SWRProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
