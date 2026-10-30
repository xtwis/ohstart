import type { ScriptType } from "@shared/types"
import type { TableColumn } from "@shared/ui"
import { command } from "@shared/command"
import { readOhstartJson, readSourceScripts } from "@shared/read"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { cloneSource, resolveDefaultKey } from "@/remote"

interface TypeFilterArgs {
  type?: string
  init?: boolean
  add?: boolean
}

interface ScriptRow {
  type: string
  name: string
  description: string
}

const columns: TableColumn<ScriptRow>[] = [
  { render: row => row.type },
  { render: row => ui.primary(row.name) },
  { render: row => row.description },
]

export default defineCommand({
  meta: {
    name: "list",
    alias: "ls",
    description: text.description.command.cli.list,
  },
  args: {
    source: {
      type: "positional",
      required: false,
      description: text.description.arg.source.keyName,
    },
    type: {
      type: "string",
      description: text.description.arg.flag.type,
    },
    init: {
      type: "boolean",
      description: text.description.arg.flag.init,
    },
    add: {
      type: "boolean",
      description: text.description.arg.flag.add,
    },
  },
  async run({ args }) {
    const cmd = command()
    try {
      cmd.start(text.label.command.cliList, text.description.command.cli.list)

      const wanted = resolveTypeFilter(args)
      const config = await loadConfig()
      const key = args.source ?? resolveDefaultKey(config)
      const source = config.source[key]
      if (!source)
        throw new Error(text.error.source.unknown(key))

      cmd.say(text.state.sourceListing(ui.primary(key), source.name))

      const workspace = await cloneSource(source.url)
      try {
        const meta = await readOhstartJson(workspace.dir)
        const scripts = await readSourceScripts(workspace.dir, meta)
        for (const entry of scripts) {
          if (entry.error)
            cmd.say(ui.yellow(text.warning.skippingScript(entry.name, entry.error)))
        }

        const rows = scripts.flatMap((entry) => {
          if (!entry.script)
            return []
          if (wanted && entry.script.type !== wanted)
            return []
          return [{ name: entry.name, script: entry.script }]
        })

        if (rows.length === 0) {
          cmd.say(text.state.noScriptInSource(source.name, wanted))
          cmd.finish()
          return
        }

        const tableRows: ScriptRow[] = rows.map(row => ({
          type: row.script.type,
          name: row.name,
          description: row.script.description,
        }))

        cmd.say(ui.table(tableRows, columns))
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

function resolveTypeFilter({ type, init, add }: TypeFilterArgs): ScriptType | undefined {
  const picked = [
    ...(type === undefined ? [] : [{ flag: "--type", value: type }]),
    ...(init ? [{ flag: "--init", value: "init" }] : []),
    ...(add ? [{ flag: "--add", value: "add" }] : []),
  ]

  if (picked.length > 1)
    throw new Error(text.error.command.multipleScriptTypes(picked.map(entry => entry.flag).join(", ")))

  const value = picked[0]?.value
  if (value === undefined)
    return undefined
  if (value === "")
    throw new Error(text.error.command.missingScriptType)
  if (value !== "init" && value !== "add")
    throw new Error(text.error.command.invalidScriptType(value))
  return value
}
