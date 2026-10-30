import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "trust",
    description: text.description.command.cli.source.trust,
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
      cmd.start(text.label.command.sourceTrust, text.description.command.cli.source.trust)

      const config = await loadConfig()
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(text.error.source.unknown(keyName))

      config.source[keyName] = { ...entry, trust: true }
      await saveConfig(config)
      cmd.say(text.success.sourceTrust(ui.primary(keyName), true))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
