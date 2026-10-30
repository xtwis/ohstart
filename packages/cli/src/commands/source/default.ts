import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "default",
    alias: "def",
    description: text.description.command.cli.source.default,
  },
  args: {
    keyName: {
      type: "positional",
      required: false,
      description: text.description.arg.source.keyName,
    },
  },
  async run({ args }) {
    const cmd = command()
    try {
      const { keyName } = args
      cmd.start(text.label.command.sourceDefault, text.description.command.cli.source.default)

      const config = await loadConfig()
      if (!keyName) {
        cmd.say(config.default ? ui.primary(config.default) : text.state.noDefaultSource)
        cmd.finish()
        return
      }
      if (!config.source[keyName])
        throw new Error(text.error.source.unknown(keyName))

      config.default = keyName
      await saveConfig(config)
      cmd.say(text.success.defaultSourceNow(ui.primary(keyName)))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
