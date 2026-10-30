import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "untrust",
    description: text.description.command.cli.source.untrust,
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

      const rest = { ...entry }
      delete rest.trust
      config.source[keyName] = rest
      await saveConfig(config)
      log.out(text.success.sourceTrust(keyName, false))
    }
    catch (error) {
      fail(error)
    }
  },
})
