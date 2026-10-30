import type { TableColumn } from "@shared/ui"
import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"

const columns: TableColumn<[string, string]>[] = [
  { render: pair => ui.primary(pair[0]) },
  { render: pair => pair[1] },
]

export default defineCommand({
  meta: {
    name: "view",
    description: text.description.command.cli.source.view,
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
      cmd.start(text.label.command.sourceView, text.description.command.cli.source.view)

      const config = await loadConfig()
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(text.error.source.unknown(keyName))

      const pairs: [string, string][] = [
        [text.label.field.key, keyName],
        [text.label.field.name, entry.name],
        [text.label.field.url, entry.url],
        [text.label.field.trust, String(entry.trust ?? false)],
        [text.label.field.note, entry.note ?? ""],
        [text.label.field.default, String(config.default === keyName)],
      ]

      cmd.say(ui.table(pairs, columns))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
