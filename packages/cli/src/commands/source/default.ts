import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"
import { log } from "@/logger"

export default defineCommand({
  meta: {
    name: "default",
    description: "查看或设置默认 source",
  },
  args: {
    keyName: {
      type: "positional",
      required: false,
      description: "source 的 key name",
    },
  },
  async run({ args }) {
    try {
      const config = await loadConfig()
      const { keyName } = args
      if (!keyName) {
        log.info(config.default ?? "no default source")
        return
      }
      if (!config.source[keyName])
        throw new Error(`unknown source ${keyName}`)

      config.default = keyName
      await saveConfig(config)
      log.info(`default source is now ${keyName}`)
    }
    catch (error) {
      log.fail(error)
    }
  },
})
