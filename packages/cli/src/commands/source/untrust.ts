import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "untrust",
    description: "撤销一个 source 的信任",
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

      const rest = { ...entry }
      delete rest.trust
      config.source[keyName] = rest
      await saveConfig(config)
      log.info(`source ${keyName} is no longer trusted`)
    }
    catch (error) {
      fail(error)
    }
  },
})
