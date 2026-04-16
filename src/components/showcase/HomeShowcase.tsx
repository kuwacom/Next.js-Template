"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Database,
  LayoutTemplate,
  Link2,
  Palette,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";

function SourcePill({ value }: { value: string }) {
  return (
    <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 font-mono text-xs text-muted-foreground">
      {value}
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {kicker}
      </p>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HomeShowcase() {
  const t = useTranslations("home");
  const [dialogOpen, setDialogOpen] = useState(false);

  const demoPages = [
    {
      href: "/",
      title: t("demoPages.home.title"),
      description: t("demoPages.home.description"),
      tags: [t("tags.ui"), t("tags.overview"), t("tags.entry")],
      source: "src/app/[locale]/page.tsx",
    },
    {
      href: "/docs",
      title: t("demoPages.docs.title"),
      description: t("demoPages.docs.description"),
      tags: [t("tags.mdx"), t("tags.docs"), t("tags.content")],
      source: "src/app/[locale]/docs/page.tsx",
    },
    {
      href: "/swr",
      title: t("demoPages.swr.title"),
      description: t("demoPages.swr.description"),
      tags: [t("tags.swr"), t("tags.hooks"), t("tags.crud")],
      source: "src/app/[locale]/swr/page.tsx",
    },
    {
      href: "/forms/action",
      title: t("demoPages.action.title"),
      description: t("demoPages.action.description"),
      tags: [t("tags.form"), t("tags.serverAction"), t("tags.turnstile")],
      source: "src/app/[locale]/forms/action/page.tsx",
    },
    {
      href: "/forms/api",
      title: t("demoPages.api.title"),
      description: t("demoPages.api.description"),
      tags: [t("tags.form"), t("tags.api"), t("tags.turnstile")],
      source: "src/app/[locale]/forms/api/page.tsx",
    },
  ];

  const apiExamples = [
    {
      href: "/api/v1/users",
      method: "GET",
      title: t("apiExamples.users.title"),
      description: t("apiExamples.users.description"),
      source: "src/app/api/v1/users/route.ts",
    },
    {
      href: "/api/v1/forms/contact",
      method: "POST",
      title: t("apiExamples.contact.title"),
      description: t("apiExamples.contact.description"),
      source: "src/app/api/v1/forms/contact/route.ts",
    },
  ];

  const implementationGroups = [
    {
      icon: LayoutTemplate,
      title: t("implementation.pages.title"),
      description: t("implementation.pages.description"),
      items: [
        "src/app/[locale]/page.tsx",
        "src/app/[locale]/docs/page.tsx",
        "src/app/[locale]/swr/page.tsx",
        "src/app/[locale]/forms/page.tsx",
        "src/app/[locale]/forms/action/page.tsx",
        "src/app/[locale]/forms/api/page.tsx",
      ],
    },
    {
      icon: Blocks,
      title: t("implementation.ui.title"),
      description: t("implementation.ui.description"),
      items: [
        "src/components/ui/button.tsx",
        "src/components/ui/badge.tsx",
        "src/components/ui/card.tsx",
        "src/components/ui/dialog.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/label.tsx",
        "src/components/ui/tabs.tsx",
        "src/components/ui/textarea.tsx",
      ],
    },
    {
      icon: BookOpen,
      title: t("implementation.docs.title"),
      description: t("implementation.docs.description"),
      items: [
        "content/docs/en/",
        "content/docs/ja/",
        "src/app/[locale]/docs/page.tsx",
        "src/app/[locale]/docs/[...slug]/page.tsx",
        "src/lib/mdx.ts",
        "mdx-components.tsx",
      ],
    },
    {
      icon: Database,
      title: t("implementation.data.title"),
      description: t("implementation.data.description"),
      items: [
        "src/api/apiClient.ts",
        "src/api/v1/users/index.ts",
        "src/api/v1/users/useUsers.ts",
        "src/api/v1/users/useAddUser.ts",
        "src/api/v1/users/useUpdateUser.ts",
        "src/api/v1/users/useDeleteUser.ts",
        "src/services/UserService.ts",
      ],
    },
    {
      icon: ShieldCheck,
      title: t("implementation.forms.title"),
      description: t("implementation.forms.description"),
      items: [
        "src/components/forms/TurnstileWidget.tsx",
        "src/lib/forms/contact.ts",
        "src/app/api/v1/forms/contact/route.ts",
        "src/app/[locale]/forms/action/actions.ts",
        "src/api/cloudflare/turnstile.ts",
        "src/api/discord/webhooks.ts",
      ],
    },
  ];

  return (
    <div className="space-y-10 py-10 sm:space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-slate-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8 dark:from-slate-950 dark:via-background dark:to-emerald-950/30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>{t("hero.badges.template")}</Badge>
            <Badge variant="secondary">{t("hero.badges.catalog")}</Badge>
            <Badge variant="outline">{t("hero.badges.demo")}</Badge>
            <Badge variant="outline">{t("hero.badges.docs")}</Badge>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t("hero.description")}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {t("summary.ui.title")}
                </CardTitle>
                <CardDescription>{t("summary.ui.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {t("summary.routes.title")}
                </CardTitle>
                <CardDescription>
                  {t("summary.routes.description")}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {t("summary.docs.title")}
                </CardTitle>
                <CardDescription>
                  {t("summary.docs.description")}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {t("summary.map.title")}
                </CardTitle>
                <CardDescription>{t("summary.map.description")}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#component-showcase">{t("hero.primaryCta")}</a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">{t("hero.docsCta")}</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="#implementation-map">{t("hero.mapCta")}</a>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/forms">{t("hero.formsCta")}</Link>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="size-4" />
            {t("hero.themeNote")}
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          kicker={t("docsSection.kicker")}
          title={t("docsSection.title")}
          description={t("docsSection.description")}
        />

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t("docsSection.overviewTitle")}</CardTitle>
                <SourcePill value="src/lib/mdx.ts" />
              </div>
              <CardDescription className="leading-6">
                {t("docsSection.overviewDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">content/docs/{`{locale}`}</Badge>
                <Badge variant="secondary">/docs</Badge>
                <Badge variant="secondary">index.mdx</Badge>
                <Badge variant="secondary">metadata export</Badge>
              </div>
              <div className="rounded-xl border border-dashed p-4">
                <p>{t("docsSection.detailList.one")}</p>
                <p>{t("docsSection.detailList.two")}</p>
                <p>{t("docsSection.detailList.three")}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/docs" className="flex items-center gap-2">
                  {t("docsSection.primaryCta")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t("docsSection.filesTitle")}</CardTitle>
                <SourcePill value="content/docs/" />
              </div>
              <CardDescription>{t("docsSection.filesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "content/docs/en/getting-started.mdx",
                  "content/docs/ja/getting-started.mdx",
                  "content/docs/ja/guides/index.mdx",
                  "src/app/[locale]/docs/page.tsx",
                  "src/app/[locale]/docs/[...slug]/page.tsx",
                  "src/lib/mdx.ts",
                  "mdx-components.tsx",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-lg border border-dashed px-3 py-2 font-mono text-xs sm:text-sm"
                  >
                    <Link2 className="mt-0.5 size-3 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          kicker={t("demoSection.kicker")}
          title={t("demoSection.title")}
          description={t("demoSection.description")}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {demoPages.map((page) => (
            <Card key={page.href} className="border-border/60 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>{page.title}</CardTitle>
                  <SourcePill value={page.source} />
                </div>
                <CardDescription className="leading-6">
                  {page.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {page.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link
                    href={page.href}
                    className="flex items-center justify-center gap-2"
                  >
                    {t("demoSection.openRoute", { route: page.href })}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {apiExamples.map((api) => (
            <Card key={api.href} className="border-dashed border-border/70">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{api.method}</Badge>
                    <CardTitle className="text-base">{api.title}</CardTitle>
                  </div>
                  <SourcePill value={api.source} />
                </div>
                <CardDescription className="leading-6">
                  {api.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <a href={api.href}>
                    {t("demoSection.openEndpoint", { route: api.href })}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section id="component-showcase" className="space-y-6 scroll-mt-24">
        <SectionHeading
          kicker={t("showcaseSection.kicker")}
          title={t("showcaseSection.title")}
          description={t("showcaseSection.description")}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t("showcaseSection.buttons.title")}</CardTitle>
                <SourcePill value="src/components/ui/button.tsx" />
              </div>
              <CardDescription>
                {t("showcaseSection.buttons.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button>{t("labels.default")}</Button>
                <Button variant="secondary">{t("labels.secondary")}</Button>
                <Button variant="outline">{t("labels.outline")}</Button>
                <Button variant="ghost">{t("labels.ghost")}</Button>
                <Button variant="destructive">{t("labels.destructive")}</Button>
                <Button variant="link">{t("labels.link")}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{t("labels.default")}</Badge>
                <Badge variant="secondary">{t("labels.secondary")}</Badge>
                <Badge variant="outline">{t("labels.outline")}</Badge>
                <Badge variant="destructive">{t("labels.destructive")}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t("showcaseSection.form.title")}</CardTitle>
                <SourcePill value="src/components/ui/textarea.tsx" />
              </div>
              <CardDescription>{t("showcaseSection.form.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="showcase-name">
                  {t("showcaseSection.form.nameLabel")}
                </Label>
                <Input
                  id="showcase-name"
                  defaultValue="Template Explorer"
                  aria-label={t("showcaseSection.form.nameLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-email">
                  {t("showcaseSection.form.emailLabel")}
                </Label>
                <Input
                  id="showcase-email"
                  type="email"
                  defaultValue="demo@example.com"
                  aria-label={t("showcaseSection.form.emailLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-message">
                  {t("showcaseSection.form.messageLabel")}
                </Label>
                <Textarea
                  id="showcase-message"
                  defaultValue={t("showcaseSection.form.messageValue")}
                  aria-label={t("showcaseSection.form.messageLabel")}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button">
                  {t("showcaseSection.form.primaryAction")}
                </Button>
                <Button type="button" variant="outline">
                  {t("showcaseSection.form.secondaryAction")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t("showcaseSection.tabs.title")}</CardTitle>
                <SourcePill value="src/components/ui/tabs.tsx" />
              </div>
              <CardDescription>{t("showcaseSection.tabs.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-3">
                  <TabsTrigger value="overview">
                    {t("showcaseSection.tabs.overview")}
                  </TabsTrigger>
                  <TabsTrigger value="routes">
                    {t("showcaseSection.tabs.routes")}
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    {t("showcaseSection.tabs.files")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <Card className="border-dashed">
                    <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
                      <p>{t("showcaseSection.tabs.overviewBody.one")}</p>
                      <p>{t("showcaseSection.tabs.overviewBody.two")}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="routes" className="mt-4">
                  <Card className="border-dashed">
                    <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
                      <p>{t("showcaseSection.tabs.routesBody.one")}</p>
                      <p>{t("showcaseSection.tabs.routesBody.two")}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="files" className="mt-4">
                  <Card className="border-dashed">
                    <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
                      <p>{t("showcaseSection.tabs.filesBody.one")}</p>
                      <p>{t("showcaseSection.tabs.filesBody.two")}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t("showcaseSection.dialog.title")}</CardTitle>
                <SourcePill value="src/components/ui/dialog.tsx" />
              </div>
              <CardDescription>{t("showcaseSection.dialog.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-dashed bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("showcaseSection.dialog.cardTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("showcaseSection.dialog.cardDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t("showcaseSection.dialog.cardBody")}
                </CardContent>
                <CardFooter className="gap-2">
                  <Badge variant="outline">
                    {t("showcaseSection.dialog.cardTagOne")}
                  </Badge>
                  <Badge variant="secondary">
                    {t("showcaseSection.dialog.cardTagTwo")}
                  </Badge>
                </CardFooter>
              </Card>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    {t("showcaseSection.dialog.open")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("showcaseSection.dialog.modalTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("showcaseSection.dialog.modalDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {t("showcaseSection.dialog.modalBody")}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setDialogOpen(false)}
                    >
                      {t("showcaseSection.dialog.close")}
                    </Button>
                    <Button type="button" onClick={() => setDialogOpen(false)}>
                      {t("showcaseSection.dialog.confirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="implementation-map" className="space-y-6 scroll-mt-24">
        <SectionHeading
          kicker={t("implementationSection.kicker")}
          title={t("implementationSection.title")}
          description={t("implementationSection.description")}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {implementationGroups.map((group) => {
            const Icon = group.icon;

            return (
              <Card key={group.title} className="border-border/60 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-border/70 bg-muted/40 p-2">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{group.title}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-lg border border-dashed px-3 py-2 font-mono text-xs sm:text-sm"
                      >
                        <Link2 className="mt-0.5 size-3 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
