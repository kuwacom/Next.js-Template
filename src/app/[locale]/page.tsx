import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { HomeShowcase } from "@/components/showcase/HomeShowcase";
import { getAlternateLinks, getLocalizedHref } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";

type MarketingPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: MarketingPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLocalizedHref(locale, "/"),
      languages: getAlternateLinks("/"),
    },
  };
}

export default async function MarketingPage({ params }: MarketingPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <HomeShowcase />;
}
