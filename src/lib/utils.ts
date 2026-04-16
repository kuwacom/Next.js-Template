import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClientIp(headers: Pick<Headers, "get">) {
  const forwardedFor = headers.get("x-forwarded-for");

  // 代表的な proxy header を順に見て送信元 IP を推定する
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-client-ip") ??
    null
  );
}
