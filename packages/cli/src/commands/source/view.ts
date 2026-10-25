import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "view",
    description: text.description.command.cli.source.view,
  },
  args: {
    keyName: {
      type: "positional",
      required: true,
      description: text.description.arg.source.keyName,
    },
  },
  async run({ args }) {
    try {
      const { keyName } = args
      const config = await loadConfig()
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(text.error.source.unknown(keyName))

      log.info(`${text.label.field.key}: ${keyName}`)
      log.info(`${text.label.field.name}: ${entry.name}`)
      log.info(`${text.label.field.url}: ${entry.url}`)
      log.info(`${text.label.field.trust}: ${entry.trust ?? false}`)
      log.info(`${text.label.field.note}: ${entry.note ?? ""}`)
      log.info(`${text.label.field.default}: ${config.default === keyName}`)
    }
    catch (error) {
      fail(error)
    }
  },
})
