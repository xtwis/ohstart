import type { ArgvSchema } from "@shared/argv/schema"
import type { ScriptJson, ScriptType } from "@shared/types"
import { loadArgvSchema, resolveArgvFile } from "@shared/argv/load"
import { resolveInside } from "@shared/path"
import { readOhstartJson, readScriptJson } from "@shared/read"
import { text } from "@shared/text"

export interface PrepareScriptOptions {
  root: string
  name: string
  type: ScriptType
  sdkUrl: string
  sourceLabel?: string
  command?: string
}

export interface PreparedScript {
  scriptDir: string
  script: ScriptJson
  schema: ArgvSchema
}

export async function prepareScript({ root, name, type, sdkUrl, sourceLabel, command }: PrepareScriptOptions): Promise<PreparedScript> {
  const meta = await readOhstartJson(root)
  const path = meta.scripts[name]
  if (!path)
    throw new Error(text.error.script.unknown(name, sourceLabel ?? meta.name))

  const scriptDir = resolveInside(root, path)
  if (!scriptDir)
    throw new Error(text.error.project.root.pathOutsideSource(path))

  const script = await readScriptJson(root, path)
  if (script.name !== name)
    throw new Error(text.error.script.nameMismatch(script.name, name))
  if (script.type !== type)
    throw new Error(text.error.script.wrongType(name, script.type, command ?? "ohstart"))

  const schema = await loadArgvSchema(await resolveArgvFile(scriptDir, script), sdkUrl)
  return { scriptDir, script, schema }
}
