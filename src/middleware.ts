import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 許可するオリジンを限定する例
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = ["*"]; // ここに許可するオリジンを追加

  console.log("Request Origin:", origin);

  // リクエストしてきたオリジンが許可リストにある場合のみヘッダーを設定
  // それ以外は隠蔽
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
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
    return new Response(null, {
      status: 200,
      headers: res.headers,
    });
  }

  return res;
}

export const config = {
  matcher: "/api/:path*",
};
