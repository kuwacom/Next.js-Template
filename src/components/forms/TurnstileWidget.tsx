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
      remove?: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetCopy = {
  apiUnavailable: string;
  expired: string;
  initError: string;
  loadError: string;
  missingSiteKey: string;
};

type TurnstileWidgetProps = {
  action: string;
  className?: string;
  copy: TurnstileWidgetCopy;
  onTokenChange: (token: string) => void;
  siteKey?: string;
};

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ action, className, copy, onTokenChange, siteKey }, ref) {
  const widgetContainerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );

  const missingSiteKeyMessage = siteKey ? null : copy.missingSiteKey;
  const apiUnavailableMessage =
    typeof window !== "undefined" &&
    scriptReady &&
    window.turnstile &&
    typeof window.turnstile.render !== "function"
      ? copy.apiUnavailable
      : null;

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }

        setErrorMessage(null);
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
      !window.turnstile ||
      typeof window.turnstile.render !== "function"
    ) {
      return;
    }

    // api.js の onload 後は ready を経由せず render を直接呼ぶ
    if (widgetIdRef.current && window.turnstile.remove) {
      // 再描画時に古い widget が残らないよう先に片付ける
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
          errorCode ? `${copy.initError} (${errorCode})` : copy.initError,
        );
      },
      "expired-callback": () => {
        onTokenChange("");
        setErrorMessage(copy.expired);
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
  }, [action, copy.expired, copy.initError, onTokenChange, scriptReady, siteKey]);

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
          setErrorMessage(copy.loadError);
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
