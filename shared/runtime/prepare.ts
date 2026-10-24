import type { ArgvSchema } from "@shared/argv/schema"
import type { ScriptJson, ScriptType } from "@shared/types"
import { loadArgvSchema, resolveArgvFile } from "@shared/argv/load"
import { resolveInside } from "@shared/path"
import { readOhstartJson, readScriptJson } from "@shared/read"

export interface PrepareScriptOptions {
  root: string
  name: string
  type: ScriptType
  sdkUrl: string
  sourceLabel?: string
}

export interface PreparedScript {
  scriptDir: string
  script: ScriptJson
  schema: ArgvSchema
}

export async function prepareScript({ root, name, type, sdkUrl, sourceLabel }: PrepareScriptOptions): Promise<PreparedScript> {
  const meta = await readOhstartJson(root)
  const path = meta.scripts[name]
  if (!path)
    throw new Error(`unknown script ${name} in source ${sourceLabel ?? meta.name}`)

  const scriptDir = resolveInside(root, path)
  if (!scriptDir)
    throw new Error(`script "${name}": path "${path}" is not inside the source`)

  const script = await readScriptJson(root, path)
  if (script.name !== name)
    throw new Error(`script.json name ${script.name} does not match ${name}`)
  if (script.type !== type)
    throw new Error(`script ${name} is a ${script.type} script, use \`ohstart ${script.type}\``)

  const schema = await loadArgvSchema(await resolveArgvFile(scriptDir, script), sdkUrl)
  return { scriptDir, script, schema }
}
