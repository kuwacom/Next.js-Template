"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Blocks,
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

const demoPages = [
  {
    href: "/",
    title: "UI Components Catalog",
    description:
      "このトップ画面で、shadcn/ui ベースの主要コンポーネントとテンプレート全体の構成をまとめて確認できます。",
    tags: ["UI", "Overview", "Entry"],
    source: "src/app/page.tsx",
  },
  {
    href: "/swr",
    title: "SWR CRUD Demo",
    description:
      "users API を使った loading, error, mutation の一連の実装例を確認できます。",
    tags: ["SWR", "Hooks", "CRUD"],
    source: "src/app/swr/page.tsx",
  },
  {
    href: "/from/action",
    title: "Turnstile + Server Action",
    description:
      "Server Action を送信先にしたフォーム実装です。Next.js サーバー前提の最短構成を確認できます。",
    tags: ["Form", "Server Action", "Turnstile"],
    source: "src/app/from/action/page.tsx",
  },
  {
    href: "/from/api",
    title: "Turnstile + API Route",
    description:
      "フロントから API を叩くフォーム実装です。静的配信やフロント/バック分離寄りの構成を確認できます。",
    tags: ["Form", "API", "Turnstile"],
    source: "src/app/from/api/page.tsx",
  },
];

const apiExamples = [
  {
    href: "/api/v1/users",
    method: "GET",
    title: "Users API",
    description:
      "SWR デモの一覧取得先です。レスポンス形状と in-memory データの動作をそのまま確認できます。",
    source: "src/app/api/v1/users/route.ts",
  },
  {
    href: "/api/v1/users/1",
    method: "GET",
    title: "User Detail API",
    description:
      "単体取得のサンプルです。PUT / DELETE も同じ route handler でまとまっています。",
    source: "src/app/api/v1/users/[userId]/route.ts",
  },
];

const implementationGroups = [
  {
    icon: LayoutTemplate,
    title: "App Router Pages",
    description: "画面の入口とデモページ群",
    items: [
      "src/app/page.tsx",
      "src/app/swr/page.tsx",
      "src/app/from/action/page.tsx",
      "src/app/from/api/page.tsx",
    ],
  },
  {
    icon: Blocks,
    title: "UI Components",
    description: "shadcn/ui ベースのコンポーネント",
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
    icon: Database,
    title: "API / Data Layer",
    description: "API 呼び出し、hooks、サンプルデータ",
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
    title: "Form / Security",
    description: "Turnstile, schema, backend relay",
    items: [
      "src/components/forms/TurnstileWidget.tsx",
      "src/lib/forms/contact.ts",
      "src/app/api/v1/forms/contact/route.ts",
      "src/app/api/forms/contact/route.ts",
      "src/api/cloudflare/turnstile.ts",
      "src/api/discord/webhooks.ts",
    ],
  },
];

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
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-10 py-10 sm:space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-slate-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8 dark:from-slate-950 dark:via-background dark:to-emerald-950/30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>Next.js Template</Badge>
            <Badge variant="secondary">UI Catalog</Badge>
            <Badge variant="outline">SWR / API / Forms</Badge>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
              UI コンポーネントと実装例をまとめて確認できるトップページ
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              UI コンポーネントの表示例、各種デモページへのリンク、API と実装ファイルの参照先をまとめて確認できます。
              フォーム専用の入口ではなく、このテンプレート全体の使い方を見渡すためのハブです。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">UI Components</CardTitle>
                <CardDescription>
                  Button, Badge, Card, Tabs, Dialog, Input, Label, Textarea
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Demo Routes</CardTitle>
                <CardDescription>
                  SWR CRUD, Server Action Form, API Form をすぐ遷移できます
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-white/60 bg-background/80 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Implementation Map</CardTitle>
                <CardDescription>
                  主要ソースの場所までトップから辿れるようにしています
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="#component-showcase">UI 一覧を見る</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#implementation-map">実装マップを見る</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/swr">SWR デモへ</Link>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="size-4" />
            テーマ切り替えはヘッダー右上から確認できます。
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          kicker="Demo Routes"
          title="各実装例へのリンク"
          description="画面ごとの役割がすぐ分かるように、既存デモページと API 確認用の入口をカード化しました。"
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
                    {page.href} を開く
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
                  <Link href={api.href}>{api.href} を確認する</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section id="component-showcase" className="space-y-6 scroll-mt-24">
        <SectionHeading
          kicker="UI Showcase"
          title="全 UI コンポーネントの表示例"
          description="現在このテンプレートに入っている UI コンポーネントを、その場で見比べられるようにまとめています。"
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Button / Badge</CardTitle>
                <SourcePill value="src/components/ui/button.tsx" />
              </div>
              <CardDescription>
                代表的なボタン variant と、状態ラベル向け badge を並べています。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Form Controls</CardTitle>
                <SourcePill value="src/components/ui/input.tsx" />
              </div>
              <CardDescription>
                Label, Input, Textarea を使った基本的なフォーム断面です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="showcase-name">Name</Label>
                <Input
                  id="showcase-name"
                  defaultValue="Template Explorer"
                  aria-label="showcase name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-email">Email</Label>
                <Input
                  id="showcase-email"
                  type="email"
                  defaultValue="demo@example.com"
                  aria-label="showcase email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-message">Message</Label>
                <Textarea
                  id="showcase-message"
                  defaultValue="Textarea を含む入力 UI の見え方をここで確認できます。"
                  aria-label="showcase message"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button">Primary Action</Button>
                <Button type="button" variant="outline">
                  Secondary
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Tabs</CardTitle>
                <SourcePill value="src/components/ui/tabs.tsx" />
              </div>
              <CardDescription>
                ひとつの UI から overview, routes, files を切り替える例です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="routes">Routes</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <Card className="border-dashed">
                    <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
                      <p>このトップページ自体がテンプレートの総合案内です。</p>
                      <p>画面デモ、API、ソース構成まで一度に確認できます。</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="routes" className="mt-4">
                  <Card className="border-dashed">
                    <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
                      <p>`/swr` では CRUD のデータ更新フローを確認できます。</p>
                      <p>`/from/action` と `/from/api` はフォーム実装の比較用です。</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="files" className="mt-4">
                  <Card className="border-dashed">
                    <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
                      <p>`src/components/ui/*` に shadcn/ui ベースの実装があります。</p>
                      <p>`src/api/*` と `src/app/api/*` にデータ層と route handler があります。</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Dialog / Card</CardTitle>
                <SourcePill value="src/components/ui/dialog.tsx" />
              </div>
              <CardDescription>
                Dialog と Card の組み合わせを、その場で操作して確認できます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-dashed bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base">Card Anatomy</CardTitle>
                  <CardDescription>
                    Header, Content, Footer の見え方サンプルです。
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  説明文や操作ボタンを載せるための土台として使えます。
                </CardContent>
                <CardFooter className="gap-2">
                  <Badge variant="outline">Reusable</Badge>
                  <Badge variant="secondary">Layout</Badge>
                </CardFooter>
              </Card>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    Dialog を開いて確認する
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Preview</DialogTitle>
                    <DialogDescription>
                      モーダル表示、フォーカス制御、閉じる導線を確認するためのサンプルです。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    確認ダイアログ、編集フォーム、詳細プレビューなどに流用できます。
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setDialogOpen(false)}
                    >
                      閉じる
                    </Button>
                    <Button type="button" onClick={() => setDialogOpen(false)}>
                      理解した
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
          kicker="Implementation Map"
          title="主要ファイルと実装の対応表"
          description="どこを読めば何が分かるかを、役割別にざっと追えるようにしています。"
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
