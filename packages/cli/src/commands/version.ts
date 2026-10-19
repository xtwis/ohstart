import { defineCommand } from "citty"
import { log } from "@/logger"
import { VERSION } from "@/version"

export default defineCommand({
  meta: {
    name: "version",
    description: "打印 ohstart 版本号",
  },
  run() {
    log.info(VERSION)
  },
})
