"use client";

import { useSyncExternalStore } from "react";
import { authStore } from "@/stores/authStore";

/*
 * useAuth は authStore の React用フロントhook
 *
 * 実際の認証状態の本体は authStore にある
 * この hook はそれを React コンポーネントから使いやすい形で返す
 *
 * useAuth からログイン・ログアウトしても
 * apiClient と SWR hooks は同じ authStore を通して同期される
 */

/**
 * 認証状態と更新関数を React コンポーネント向けに返す
 *
 * - 状態の実体は `authStore`
 * - 購読は `useSyncExternalStore`
 * - `setSession` / `setAccessToken` / `logout` は authStore を直接更新
 *
 * UI 側は hook として扱いやすくなり
 * 下層の API 層は同じ認証状態を React 外から参照できる
 */
export function useAuth() {
  const authState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );

  return {
    ...authState,
    isAuthenticated: authState.status === "authenticated",
    setSession: authStore.setSession,
    setAccessToken: authStore.setAccessToken,
    clearSession: authStore.clearSession,
    logout: authStore.clearSession,
  };
}
