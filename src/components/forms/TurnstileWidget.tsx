"use client";

import Script from "next/script";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement | string,
        options: {
          action?: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          sitekey: string;
          theme?: "auto" | "light" | "dark";
        },
      ): string;
      remove?(widgetId: string): void;
      reset(widgetId?: string): void;
    };
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  action: string;
  className?: string;
  onTokenChange: (token: string) => void;
  siteKey?: string;
};

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ action, className, onTokenChange, siteKey }, ref) {
  const widgetContainerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );
  const missingSiteKeyMessage = siteKey
    ? null
    : "NEXT_PUBLIC_TURNSTILE_SITE_KEY が未設定のため Turnstile を表示できません";
  const apiUnavailableMessage =
    typeof window !== "undefined" &&
    scriptReady &&
    window.turnstile &&
    typeof window.turnstile.render !== "function"
      ? "Turnstile API の初期化が完了していません"
      : null;

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }

        onTokenChange("");
      },
    }),
    [onTokenChange],
  );

  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !containerRef.current ||
      !window.turnstile
    ) {
      return;
    }

    // api.js の onload 後は ready を経由せず render を直接呼ぶ
    if (typeof window.turnstile.render !== "function") {
      return;
    }

    // 再描画時に古い widget が残らないよう先に片付ける
    if (widgetIdRef.current && window.turnstile.remove) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      action,
      callback: (token) => {
        setErrorMessage(null);
        onTokenChange(token);
      },
      "error-callback": (errorCode) => {
        onTokenChange("");
        setErrorMessage(
          errorCode
            ? `Turnstile の初期化に失敗しました ${errorCode}`
            : "Turnstile の初期化に失敗しました",
        );
        return true;
      },
      "expired-callback": () => {
        onTokenChange("");
        setErrorMessage("認証の有効期限が切れました もう一度確認してください");
      },
      sitekey: siteKey,
      theme: "auto",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, onTokenChange, scriptReady, siteKey]);

  return (
    <div className={className}>
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={() => {
          setErrorMessage(null);
          setScriptReady(true);
        }}
        onError={() => {
          setScriptReady(false);
          setErrorMessage(
            "Turnstile のスクリプトを読み込めませんでした ネットワーク設定や拡張機能を確認してください",
          );
        }}
      />

      <div id={widgetContainerId} ref={containerRef} />

      {missingSiteKeyMessage || apiUnavailableMessage || errorMessage ? (
        <p className="mt-2 text-sm text-destructive">
          {missingSiteKeyMessage || apiUnavailableMessage || errorMessage}
        </p>
      ) : null}
    </div>
  );
});
