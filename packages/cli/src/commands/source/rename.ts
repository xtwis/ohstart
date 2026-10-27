import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "rename",
    alias: ["ren", "mv"],
    description: text.description.command.cli.source.rename,
  },
  args: {
    keyName: {
      type: "positional",
      required: true,
      description: text.description.arg.source.keyName,
    },
    newKeyName: {
      type: "positional",
      required: false,
      description: text.description.arg.source.newKeyName,
    },
  },
  async run({ args }) {
    try {
      const { keyName, newKeyName } = args
      const config = await loadConfig()
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(text.error.source.unknown(keyName))
      if (!newKeyName)
        throw new Error(text.error.source.missingKeyName)
      if (newKeyName === keyName)
        throw new Error(text.error.source.sameKeyName(keyName))
      if (config.source[newKeyName])
        throw new Error(text.error.source.keyExists(newKeyName))

      delete config.source[keyName]
      config.source[newKeyName] = entry
      if (config.default === keyName)
        config.default = newKeyName
      await saveConfig(config)
      log.info(text.success.renamedSource(keyName, newKeyName))
    }
    catch (error) {
      fail(error)
    }
  },
})
