import { command } from "@shared/command"
import { prompt } from "@shared/prompts"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "remove",
    alias: "rm",
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
    const cmd = command()
    try {
      const { keyName } = args
      cmd.start(text.label.command.sourceRemove, text.description.command.cli.source.remove)

      const config = await loadConfig()
      if (!config.source[keyName])
        throw new Error(text.error.source.unknown(keyName))

      const answer = await cmd.step(() => prompt.confirm({ message: text.question.removeSource(ui.primary(keyName)), initialValue: false }))
      if (!answer) {
        cmd.say(text.state.cancelled)
        cmd.finish()
        return
      }

      delete config.source[keyName]
      if (config.default === keyName)
        delete config.default
      await saveConfig(config)
      cmd.say(text.success.removedSource(ui.primary(keyName)))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
