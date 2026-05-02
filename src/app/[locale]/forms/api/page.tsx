import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import env from "@/config/env";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAlternateLinks, getLocalizedHref, Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";

import { ApiContactForm } from "./ApiContactForm";

type ApiPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: ApiPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "forms" });

  return {
    title: t("apiMetaTitle"),
    description: t("apiMetaDescription"),
    alternates: {
      canonical: getLocalizedHref(locale, "/forms/api"),
      languages: getAlternateLinks("/forms/api"),
    },
  };
}

export default async function ApiPage({ params }: ApiPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "forms" });

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {t("apiRouteLabel")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("apiTitle")}</h1>
        <p className="max-w-2xl text-muted-foreground">{t("apiDescription")}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ApiContactForm
          locale={locale}
          pagePath={`/${locale}/forms/api`}
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>{t("apiFeatureTitle")}</CardTitle>
            <CardDescription>{t("apiFeatureDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t("apiFeaturePointOne")}</p>
            <p>{t("apiFeaturePointTwo")}</p>
            <p>
              {t("apiFeaturePointThree")}{" "}
              <Link
                href="/forms/action"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t("apiFeatureLink")}
              </Link>
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/forms/action">{t("apiFeatureButton")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
