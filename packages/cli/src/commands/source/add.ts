import { fail, log } from "@shared/logger"
import { prompt } from "@shared/prompts"
import { readOhstartJson } from "@shared/read"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"
import { cloneSource } from "@/remote"

export default defineCommand({
  meta: {
    name: "add",
    description: text.description.command.cli.source.add,
  },
  args: {
    url: {
      type: "positional",
      required: true,
      description: text.description.arg.source.url,
    },
    key: {
      type: "string",
      description: text.description.arg.source.keyNameOption,
    },
    note: {
      type: "string",
      description: text.description.arg.source.note,
    },
    trust: {
      type: "boolean",
      description: text.description.arg.source.trust,
    },
  },
  async run({ args }) {
    try {
      const { url, key, note, trust } = args
      if (args._.length > 1)
        throw new Error(text.error.command.unexpectedArguments(args._.slice(1).join(" ")))

      const workspace = await cloneSource(url)
      try {
        const meta = await readOhstartJson(workspace.dir)
        const config = await loadConfig()
        let keyName = key ?? meta.name
        while (config.source[keyName]) {
          keyName = await prompt.text({
            message: text.question.enterKeyName(keyName),
            validate: value => (value?.trim().length ?? 0) > 0 ? undefined : text.question.argRequired(text.terms.keyName),
          })
        }

        config.source[keyName] = {
          name: meta.name,
          url,
          ...(trust ? { trust: true } : {}),
          ...(note ? { note } : {}),
        }
        await saveConfig(config)
        log.info(text.success.addedSource(keyName, url, meta.name))
      }
      finally {
        await workspace.dispose()
      }
    }
    catch (error) {
      fail(error)
    }
  },
})
