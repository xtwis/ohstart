import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { log } from "@/logger"
import { cloneSource, readSourceMeta, readSourceScripts, resolveDefaultSource } from "@/remote"

export default defineCommand({
  meta: {
    name: "list",
    description: "按 init / add 类型列出可用脚本",
  },
  args: {
    type: {
      type: "positional",
      required: false,
      description: "只看 init 或 add",
    },
  },
  async run({ args }) {
    try {
      const wanted = args.type
      if (wanted && wanted !== "init" && wanted !== "add")
        throw new Error(`unknown script type ${wanted}, expected init or add`)

      const config = await loadConfig()
      const source = resolveDefaultSource(config)

      const workspace = await cloneSource(source.url)
      try {
        const meta = await readSourceMeta(workspace.dir)
        const scripts = await readSourceScripts(workspace.dir, meta)
        for (const entry of scripts) {
          if (entry.error)
            log.warn(`skipping ${entry.name}: ${entry.error}`)
        }

        const rows = scripts.flatMap((entry) => {
          if (!entry.script)
            return []
          if (wanted && entry.script.type !== wanted)
            return []
          return [{ name: entry.name, script: entry.script }]
        })

        if (rows.length === 0) {
          log.info(wanted ? `no ${wanted} script in source ${source.name}` : `no script in source ${source.name}`)
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
      log.fail(error)
    }
  },
})
