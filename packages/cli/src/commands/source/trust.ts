import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "trust",
    description: text.description.command.cli.source.trust,
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

      config.source[keyName] = { ...entry, trust: true }
      await saveConfig(config)
      log.out(text.success.sourceTrust(keyName, true))
    }
    catch (error) {
      fail(error)
    }
  },
})
