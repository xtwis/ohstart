import { command } from "@shared/command"
import { prompt } from "@shared/prompts"
import { readOhstartJson } from "@shared/read"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
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
    const cmd = command()
    try {
      const { url, key, note, trust } = args
      cmd.start(text.label.command.sourceAdd, text.description.command.cli.source.add)

      if (args._.length > 1)
        throw new Error(text.error.command.unexpectedArguments(args._.slice(1).join(" ")))

      const workspace = await cloneSource(url)
      try {
        const meta = await readOhstartJson(workspace.dir)
        const config = await loadConfig()
        let keyName = key ?? meta.name
        while (config.source[keyName]) {
          keyName = await cmd.step(() => prompt.text({
            message: text.question.enterKeyName(ui.primary(keyName)),
            validate: value => (value?.trim().length ?? 0) > 0 ? undefined : text.question.argRequired(text.terms.keyName),
          }))
        }

        config.source[keyName] = {
          name: meta.name,
          url,
          ...(trust ? { trust: true } : {}),
          ...(note ? { note } : {}),
        }
        await saveConfig(config)
        cmd.say(text.success.addedSource(ui.primary(keyName), url, meta.name))
      }
      finally {
        await workspace.dispose()
      }

      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
