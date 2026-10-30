import type { TableColumn } from "@shared/ui"
import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"

interface SourceRow {
  mark: string
  key: string
  name: string
  url: string
  trusted: boolean
}

const columns: TableColumn<SourceRow>[] = [
  { render: row => row.mark },
  { render: row => ui.primary(row.key) + (row.trusted ? ` (${text.label.mark.trusted})` : "") },
  { render: row => row.name },
  { render: row => row.url },
]

export default defineCommand({
  meta: {
    name: "list",
    alias: "ls",
    description: text.description.command.cli.source.list,
  },
  async run() {
    const cmd = command()
    try {
      cmd.start(text.label.command.sourceList, text.description.command.cli.source.list)

      const config = await loadConfig()
      const entries = Object.entries(config.source)
      if (entries.length === 0) {
        cmd.say(text.state.noSourceConfigured)
        cmd.finish()
        return
      }

      const rows: SourceRow[] = entries.map(([keyName, entry]) => ({
        mark: keyName === config.default ? "*" : "",
        key: keyName,
        name: entry.name,
        url: entry.url,
        trusted: entry.trust === true,
      }))

      cmd.say(ui.table(rows, columns))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
