import type { ScriptType } from "@shared/types"
import { fail, log } from "@shared/logger"
import { readOhstartJson, readSourceScripts } from "@shared/read"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { cloneSource, resolveDefaultKey } from "@/remote"

interface TypeFilterArgs {
  type?: string
  init?: boolean
  add?: boolean
}

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
    try {
      const wanted = resolveTypeFilter(args)
      const config = await loadConfig()
      const key = args.source ?? resolveDefaultKey(config)
      const source = config.source[key]
      if (!source)
        throw new Error(text.error.source.unknown(key))

      log.info(text.state.sourceListing(key, source.name))
      log.info("")

      const workspace = await cloneSource(source.url)
      try {
        const meta = await readOhstartJson(workspace.dir)
        const scripts = await readSourceScripts(workspace.dir, meta)
        for (const entry of scripts) {
          if (entry.error)
            log.warn(text.warning.skippingScript(entry.name, entry.error))
        }

        const rows = scripts.flatMap((entry) => {
          if (!entry.script)
            return []
          if (wanted && entry.script.type !== wanted)
            return []
          return [{ name: entry.name, script: entry.script }]
        })

        if (rows.length === 0) {
          log.info(text.state.noScriptInSource(source.name, wanted))
          return
        }

        const width = Math.max(...rows.map(row => row.name.length))
        for (const row of rows)
          log.info(`${row.script.type.padEnd(4)} ${row.name.padEnd(width)}  ${row.script.description}`)
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
