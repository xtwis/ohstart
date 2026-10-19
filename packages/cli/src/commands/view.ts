import type { ArgvSchema, ScriptJson } from "@ohstart/sdk"
import { access } from "node:fs/promises"
import { join } from "node:path"
import { defineCommand } from "citty"
import { loadConfig } from "@/config"
import { log } from "@/logger"
import { cloneSource, parseScriptAddress, readScriptJson, readSourceMeta } from "@/remote"
import { loadArgvSchema } from "@/runtime/argv"

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
        const meta = await readSourceMeta(workspace.dir)
        const path = meta.scripts?.[target.name]
        if (!path)
          throw new Error(`unknown script ${target.name} in source ${target.source.name}`)

        const script = await readScriptJson(workspace.dir, path)
        if (script.name !== target.name)
          throw new Error(`script.json name ${script.name} does not match ${target.name}`)

        const argv = script.argv ?? "./argv.ts"
        const argvPath = join(workspace.dir, path, argv)
        try {
          await access(argvPath)
        }
        catch {
          throw new Error(`script ${target.name} missing argv.ts`)
        }
        const schema = await loadArgvSchema(argvPath)

        log.info(`name: ${script.name}`)
        log.info(`type: ${script.type}`)
        log.info(`description: ${script.description}`)
        log.info(`path: ${path}`)
        log.info(`entry: ${script.entry ?? "index.ts"}`)
        log.info(`argv: ${argv}`)
        log.info(`usage: ${renderUsage(script, schema)}`)
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
