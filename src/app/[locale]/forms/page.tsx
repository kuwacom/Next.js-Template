import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
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

type FormsOverviewPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: FormsOverviewPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "forms" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLocalizedHref(locale, "/forms"),
      languages: getAlternateLinks("/forms"),
    },
  };
}

export default async function FormsOverviewPage({
  params,
}: FormsOverviewPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "forms" });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-12 pt-4">
      <section className="space-y-4">
        <Badge variant="secondary">{t("badge")}</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle>{t("overviewActionTitle")}</CardTitle>
            <CardDescription className="leading-6">
              {t("overviewActionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/forms/action">{t("openAction")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle>{t("overviewApiTitle")}</CardTitle>
            <CardDescription className="leading-6">
              {t("overviewApiDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/forms/api">{t("openApi")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle>{t("compareTitle")}</CardTitle>
          <CardDescription className="leading-6">
            {t("compareDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t("comparePointOne")}</p>
          <p>{t("comparePointTwo")}</p>
          <p>{t("comparePointThree")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
