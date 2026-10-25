import { fail, log } from "@shared/logger"
import { prompt } from "@shared/prompts"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "remove",
    description: text.description.command.cli.source.remove,
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
      if (!config.source[keyName])
        throw new Error(text.error.source.unknown(keyName))

      if (!(await prompt.confirm(text.question.removeSource(keyName), { default: false }))) {
        log.info(text.state.cancelled)
        return
      }

      delete config.source[keyName]
      if (config.default === keyName)
        delete config.default
      await saveConfig(config)
      log.info(text.success.removedSource(keyName))
    }
    catch (error) {
      fail(error)
    }
  },
})
