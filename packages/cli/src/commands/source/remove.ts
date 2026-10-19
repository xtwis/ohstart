import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config.js"
import { log } from "@/logger.js"

export default defineCommand({
  meta: {
    name: "remove",
    description: "移除一个 source",
  },
  args: {
    keyName: {
      type: "positional",
      required: true,
      description: "source 的 key name",
    },
  },
  async run({ args }) {
    try {
      const { keyName } = args
      const config = await loadConfig()
      if (!config.source[keyName])
        throw new Error(`unknown source ${keyName}`)

      delete config.source[keyName]
      if (config.default === keyName)
        delete config.default
      await saveConfig(config)
      log.info(`removed source ${keyName}`)
    }
    catch (error) {
      log.fail(error)
    }
  },
})
