import { log } from "@shared/logger"
import { defineCommand } from "citty"
import { VERSION } from "@/version"

export default defineCommand({
  meta: {
    name: "version",
    description: "打印 ohstart-dev 版本号",
  },
  run() {
    log.info(VERSION)
  },
})
