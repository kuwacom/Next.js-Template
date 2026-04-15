import { getRequestConfig } from "next-intl/server";

import { routing, type AppLocale, isValidLocale } from "@/i18n/routing";

// サーバー側で locale と messages を確定する next-intl の入口
// plugin から自動で読み込まれ、各 request ごとの翻訳設定に使われる
export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale は URL prefix や middleware の判定結果から渡される
  const requestedLocale = await requestLocale;
  let locale: AppLocale;

  if (requestedLocale && isValidLocale(requestedLocale)) {
    locale = requestedLocale;
  } else {
    // 不正な locale や未指定時はデフォルト言語へ寄せる
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // locale ごとのメッセージ JSON を動的に読み込む
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
