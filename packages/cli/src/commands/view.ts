import type { ArgvSchema } from "@shared/argv/schema"
import type { ScriptJson } from "@shared/types"
import { join } from "node:path"
import { loadArgvSchema, resolveArgvFile } from "@shared/argv/load"
import { fail, log } from "@shared/logger"
import { readOhstartJson, readScriptJson } from "@shared/read"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { cloneSource, parseScriptAddress } from "@/remote"
import { SDK_URL } from "@/runtime/sdk"

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
    description: "查看脚本完整元信息",
  },
  args: {
    script: {
      type: "positional",
      required: true,
      description: "脚本名, 支持 @<key>/<name>",
    },
  },
  async run({ args }) {
    try {
      const config = await loadConfig()
      const target = parseScriptAddress(config, args.script)

      const workspace = await cloneSource(target.source.url)
      try {
        const meta = await readOhstartJson(workspace.dir)
        const path = meta.scripts?.[target.name]
        if (!path)
          throw new Error(`unknown script ${target.name} in source ${target.source.name}`)

        const script = await readScriptJson(workspace.dir, path)
        if (script.name !== target.name)
          throw new Error(`script.json name ${script.name} does not match ${target.name}`)

        const schema = await loadArgvSchema(await resolveArgvFile(join(workspace.dir, path), script), SDK_URL)

        log.info(`name: ${script.name}`)
        log.info(`type: ${script.type}`)
        log.info(`description: ${script.description}`)
        log.info(`path: ${path}`)
        log.info(`entry: ${script.entry ?? "index.ts"}`)
        log.info(`argv: ${script.argv ?? "./argv.ts"}`)
        log.info(`usage: ${renderUsage(script, schema)}`)
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
