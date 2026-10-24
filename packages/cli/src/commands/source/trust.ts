import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "trust",
    description: "把一个 source 标记为可信源",
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
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(`unknown source ${keyName}`)

      config.source[keyName] = { ...entry, trust: true }
      await saveConfig(config)
      log.info(`source ${keyName} is now trusted`)
    }
    catch (error) {
      fail(error)
    }
  },
})
