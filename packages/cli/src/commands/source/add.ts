import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"
import { log } from "@/logger"
import { prompt } from "@/prompts/index"
import { cloneSource, readSourceMeta } from "@/remote"

export default defineCommand({
  meta: {
    name: "add",
    description: "添加一个 source",
  },
  args: {
    url: {
      type: "positional",
      required: true,
      description: "源仓库的 git URL",
    },
    key: {
      type: "string",
      description: "本地 key name, 省略则取源的 name",
    },
    note: {
      type: "string",
      description: "给该源写一条本地备注",
    },
    trust: {
      type: "boolean",
      description: "标记该源为可信源",
    },
  },
  async run({ args }) {
    try {
      const { url, key, note, trust } = args
      if (args._.length > 1)
        throw new Error(`unexpected arguments: ${args._.slice(1).join(" ")}`)

      const workspace = await cloneSource(url)
      try {
        const meta = await readSourceMeta(workspace.dir)
        const config = await loadConfig()
        let keyName = key ?? meta.name
        while (config.source[keyName]) {
          keyName = await prompt.input(`source ${keyName} already exists, enter another key name`, {
            validate: value => value.trim().length > 0 || "key name is required",
          })
        }

        config.source[keyName] = {
          name: meta.name,
          url,
          ...(trust ? { trust: true } : {}),
          ...(note ? { note } : {}),
        }
        await saveConfig(config)
        log.info(`added source ${keyName} (${meta.name}) -> ${url}`)
      }
      finally {
        await workspace.dispose()
      }
    }
    catch (error) {
      log.fail(error)
    }
  },
})
