import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ApiContactForm } from "./ApiContactForm";

export default function ApiFormPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          /from/api
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Cloudflare Turnstile + API Endpoint
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          API Route を受け口として実装し、同一 Next.js アプリでも別ホスト API
          でも使えるようにした構成です。静的 build したフロントからでも `fetch`
          で利用できます。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ApiContactForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>この構成の特徴</CardTitle>
            <CardDescription>
              別ドメインのフロントや静的 export と組み合わせやすい実装です。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              フォーム画面はクライアントサイドで API を呼ぶだけなので、
              静的配信へ切り出しやすいです。
            </p>
            <p>
              API 本体は `/api/v1/forms/contact` にあり、Turnstile 検証と
              Discord 通知はサーバー側で共通化しています。
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/from/action">Server Action 版を見る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
