import { defineCommand } from "citty"
import { loadConfig } from "@/config.js"
import { log } from "@/logger.js"

export default defineCommand({
  meta: {
    name: "list",
    description: "列出已配置的 source",
  },
  async run() {
    try {
      const config = await loadConfig()
      const entries = Object.entries(config.source)
      if (entries.length === 0) {
        log.info("no source configured")
        return
      }
      for (const [keyName, entry] of entries) {
        const marker = keyName === config.default ? "*" : " "
        const trust = entry.trust ? " (trusted)" : ""
        log.info(`${marker} ${keyName}${trust}  ${entry.name}  ${entry.url}`)
      }
    }
    catch (error) {
      log.fail(error)
    }
  },
})
