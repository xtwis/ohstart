import { log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { VERSION } from "@/version"

export default defineCommand({
  meta: {
    name: "version",
    description: text.description.command.dev.version,
  },
  run() {
    log.info(VERSION)
  },
})
