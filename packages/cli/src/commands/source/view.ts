import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "view",
    description: "查看某个 source 的配置详情",
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

      log.info(`key: ${keyName}`)
      log.info(`name: ${entry.name}`)
      log.info(`url: ${entry.url}`)
      log.info(`trust: ${entry.trust ?? false}`)
      log.info(`note: ${entry.note ?? ""}`)
      log.info(`default: ${config.default === keyName}`)
    }
    catch (error) {
      fail(error)
    }
  },
})
