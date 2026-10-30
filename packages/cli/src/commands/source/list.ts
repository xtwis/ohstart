import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "list",
    alias: "ls",
    description: text.description.command.cli.source.list,
  },
  async run() {
    try {
      const config = await loadConfig()
      const entries = Object.entries(config.source)
      if (entries.length === 0) {
        log.out(text.state.noSourceConfigured)
        return
      }
      for (const [keyName, entry] of entries) {
        const marker = keyName === config.default ? "*" : " "
        const trust = entry.trust ? ` (${text.label.mark.trusted})` : ""
        log.out(`${marker} ${keyName}${trust}  ${entry.name}  ${entry.url}`)
      }
    }
    catch (error) {
      fail(error)
    }
  },
})
