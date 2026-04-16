import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

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

import { ActionContactForm } from "./ActionContactForm";
import { submitContactAction } from "./actions";

type ActionPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: ActionPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "forms" });

  return {
    title: t("actionMetaTitle"),
    description: t("actionMetaDescription"),
    alternates: {
      canonical: getLocalizedHref(locale, "/forms/action"),
      languages: getAlternateLinks("/forms/action"),
    },
  };
}

export default async function ActionPage({ params }: ActionPageProps) {
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
          {t("actionRouteLabel")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("actionTitle")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t("actionDescription")}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ActionContactForm
          locale={locale}
          pagePath={`/${locale}/forms/action`}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          submitAction={submitContactAction}
        />

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>{t("actionFeatureTitle")}</CardTitle>
            <CardDescription>{t("actionFeatureDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t("actionFeaturePointOne")}</p>
            <p>{t("actionFeaturePointTwo")}</p>
            <p>
              {t("actionFeaturePointThree")}{" "}
              <Link
                href="/forms/api"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t("actionFeatureLink")}
              </Link>
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/forms/api">{t("actionFeatureButton")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
