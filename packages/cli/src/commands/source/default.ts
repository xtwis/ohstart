import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "default",
    alias: "def",
    description: text.description.command.cli.source.default,
  },
  args: {
    keyName: {
      type: "positional",
      required: false,
      description: text.description.arg.source.keyName,
    },
  },
  async run({ args }) {
    try {
      const config = await loadConfig()
      const { keyName } = args
      if (!keyName) {
        log.out(config.default ?? text.state.noDefaultSource)
        return
      }
      if (!config.source[keyName])
        throw new Error(text.error.source.unknown(keyName))

      config.default = keyName
      await saveConfig(config)
      log.out(text.success.defaultSourceNow(keyName))
    }
    catch (error) {
      fail(error)
    }
  },
})
