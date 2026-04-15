import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function proxyApiRequest(req: NextRequest) {
  const res = NextResponse.next();

  // 許可するオリジンを限定する例
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = ["*"]; // ここに許可するオリジンを追加

  // リクエストしてきたオリジンが許可リストにある場合のみヘッダーを設定
  // それ以外は隠蔽
  if (
    origin &&
    (allowedOrigins.includes("*") || allowedOrigins.includes(origin))
  ) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: res.headers,
    });
  }

  return res;
}

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return proxyApiRequest(req);
  }

  return handleI18nRouting(req);
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
