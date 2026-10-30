import type { ArgvSchema } from "@shared/argv/schema"
import type { ScriptJson } from "@shared/types"
import type { TableColumn } from "@shared/ui"
import { join } from "node:path"
import { loadArgvSchema, resolveArgvFile } from "@shared/argv/load"
import { command } from "@shared/command"
import { readOhstartJson, readScriptJson } from "@shared/read"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { cloneSource, parseScriptAddress } from "@/remote"
import { SDK_URL } from "@/runtime/sdk"

const columns: TableColumn<[string, string]>[] = [
  { render: pair => ui.primary(pair[0]) },
  { render: pair => pair[1] },
]

function renderUsage(script: ScriptJson, schema: ArgvSchema): string {
  const parts = ["ohstart", script.type, script.name]
  for (const arg of schema.args ?? [])
    parts.push(arg.required ? `<${arg.name}>` : `[<${arg.name}>]`)
  for (const [name, flag] of Object.entries(schema.flags ?? {}))
    parts.push(flag.type === "boolean" ? `[--${name}]` : `[--${name} <value>]`)
  return parts.join(" ")
}

export default defineCommand({
  meta: {
    name: "view",
    description: text.description.command.cli.view,
  },
  args: {
    script: {
      type: "positional",
      required: true,
      description: text.description.arg.script.name,
    },
  },
  async run({ args }) {
    const cmd = command()
    try {
      cmd.start(text.label.command.cliView, text.description.command.cli.view)

      const config = await loadConfig()
      const target = parseScriptAddress(config, args.script)

      const workspace = await cloneSource(target.source.url)
      try {
        const meta = await readOhstartJson(workspace.dir)
        const path = meta.scripts?.[target.name]
        if (!path)
          throw new Error(text.error.script.unknown(target.name, target.source.name))

        const script = await readScriptJson(workspace.dir, path)
        if (script.name !== target.name)
          throw new Error(text.error.script.nameMismatch(script.name, target.name))

        const schema = await loadArgvSchema(await resolveArgvFile(join(workspace.dir, path), script), SDK_URL)

        const pairs: [string, string][] = [
          [text.label.field.name, script.name],
          [text.label.field.type, script.type],
          [text.label.field.description, script.description],
          [text.label.field.path, path],
          [text.label.field.entry, script.entry ?? text.terms.entryFile],
          [text.label.field.argv, script.argv ?? text.terms.argvFile],
          [text.label.field.usage, renderUsage(script, schema)],
        ]

        cmd.say(ui.table(pairs, columns))
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
