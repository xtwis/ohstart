import type { ArgvSchema } from "@shared/argv/schema"
import type { ScriptJson } from "@shared/types"
import { join } from "node:path"
import { loadArgvSchema, resolveArgvFile } from "@shared/argv/load"
import { fail, log } from "@shared/logger"
import { readOhstartJson, readScriptJson } from "@shared/read"
import { text } from "@shared/text"
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
    try {
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

        log.info(`${text.label.field.name}: ${script.name}`)
        log.info(`${text.label.field.type}: ${script.type}`)
        log.info(`${text.label.field.description}: ${script.description}`)
        log.info(`${text.label.field.path}: ${path}`)
        log.info(`${text.label.field.entry}: ${script.entry ?? text.terms.entryFile}`)
        log.info(`${text.label.field.argv}: ${script.argv ?? text.terms.argvFile}`)
        log.info(`${text.label.field.usage}: ${renderUsage(script, schema)}`)
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
