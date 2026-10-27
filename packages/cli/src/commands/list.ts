import { fail, log } from "@shared/logger"
import { readOhstartJson, readSourceScripts } from "@shared/read"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { cloneSource, resolveDefaultSource } from "@/remote"

export default defineCommand({
  meta: {
    name: "list",
    alias: "ls",
    description: text.description.command.cli.list,
  },
  args: {
    type: {
      type: "positional",
      required: false,
      description: text.description.arg.flag.typeFilter,
    },
  },
  async run({ args }) {
    try {
      const wanted = args.type
      if (wanted && wanted !== "init" && wanted !== "add")
        throw new Error(text.error.command.invalidScriptType(wanted))

      const config = await loadConfig()
      const source = resolveDefaultSource(config)

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
