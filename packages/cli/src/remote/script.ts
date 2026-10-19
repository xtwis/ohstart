import type { OhstartJson, ScriptJson } from "@ohstart/sdk"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export interface SourceScript {
  name: string
  path: string
  script?: ScriptJson
  error?: string
}

export async function readScriptJson(dir: string, scriptPath: string): Promise<ScriptJson> {
  let raw: string
  try {
    raw = await readFile(join(dir, scriptPath, "script.json"), "utf8")
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      throw new Error(`missing script.json in ${scriptPath}`)
    throw error
  }
  const script = JSON.parse(raw) as ScriptJson
  if (!script.name || !script.type || !script.description)
    throw new Error(`invalid script.json in ${scriptPath}`)
  return script
}

export async function readSourceScripts(dir: string, meta: OhstartJson): Promise<SourceScript[]> {
  const entries = Object.entries(meta.scripts ?? {}).sort(([a], [b]) => a.localeCompare(b))
  const scripts: SourceScript[] = []
  for (const [name, path] of entries) {
    try {
      scripts.push({ name, path, script: await readScriptJson(dir, path) })
    }
    catch (error) {
      scripts.push({ name, path, error: error instanceof Error ? error.message : String(error) })
    }
  }
  return scripts
}
