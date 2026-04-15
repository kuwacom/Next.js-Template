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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("buttonsTitle")}</CardTitle>
          <CardDescription>{t("buttonsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>{t("default")}</Button>
          <Button variant="secondary">{t("secondary")}</Button>
          <Button variant="outline">{t("outline")}</Button>
          <Button variant="ghost">{t("ghost")}</Button>
          <Button variant="destructive">{t("destructive")}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("inputsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input id="email" placeholder={t("emailPlaceholder")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("badgesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>{t("default")}</Badge>
          <Badge variant="secondary">{t("secondary")}</Badge>
          <Badge variant="outline">{t("outline")}</Badge>
          <Badge variant="destructive">{t("destructive")}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tabsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">{t("tab1")}</TabsTrigger>
              <TabsTrigger value="tab2">{t("tab2")}</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-3">
              {t("tab1Content")}
            </TabsContent>
            <TabsContent value="tab2" className="mt-3">
              {t("tab2Content")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
