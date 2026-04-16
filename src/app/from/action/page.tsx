import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { submitContactAction } from "./actions";
import { ActionContactForm } from "./ActionContactForm";

export default function ActionFormPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          /from/action
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Cloudflare Turnstile + Server Action
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Next.js サーバーが動いている前提で、Server Action をそのままフォームの
          送信先に使う実装です。Turnstile の検証と Discord Webhook 呼び出しは
          サーバー側だけで完結します。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ActionContactForm
          submitAction={submitContactAction}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>この構成の特徴</CardTitle>
            <CardDescription>
              サーバーを持つ Next.js アプリで最短に組み込めます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              フォームの `action` 先がそのまま Server Action なので、追加の API
              呼び出しコードが最小です。
            </p>
            <p>
              Discord Webhook URL と Turnstile secret
              はクライアントへ出ず、安全にサーバー側だけで利用されます。
            </p>
            <p>
              静的 export では動かないため、フロントを別ホストに切り出す場合は
              <Link
                href="/from/api"
                className="ml-1 text-primary underline-offset-4 hover:underline"
              >
                /from/api
              </Link>
              を使います。
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/from/api">API 版を見る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
