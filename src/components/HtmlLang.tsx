"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function HtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    // ルート layout で固定された lang をクライアント側で同期する
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
