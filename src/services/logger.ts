import env from "@/configs/env";
import { Logger } from "tslog";
const logger = new Logger({
  name: "next.js-template",
  minLevel: Number(env.LOG_LEVEL), // 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
});
export default logger;
