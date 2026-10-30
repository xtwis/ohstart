import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "untrust",
    description: text.description.command.cli.source.untrust,
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
      cmd.start(text.label.command.sourceUntrust, text.description.command.cli.source.untrust)

      const config = await loadConfig()
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(text.error.source.unknown(keyName))

      const rest = { ...entry }
      delete rest.trust
      config.source[keyName] = rest
      await saveConfig(config)
      cmd.say(text.success.sourceTrust(ui.primary(keyName), false))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
