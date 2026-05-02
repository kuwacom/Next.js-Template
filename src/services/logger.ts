import { Logger } from "tslog";

import env from "@/config/env";

function getLogLevel() {
  return typeof window === "undefined"
    ? env.LOG_LEVEL
    : env.NEXT_PUBLIC_LOG_LEVEL;
}

const logger = new Logger({
  name: "next.js-template",
  // client では NEXT_PUBLIC_ 付きのログレベルだけを参照する
  minLevel: getLogLevel(), // 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
});
export default logger;
