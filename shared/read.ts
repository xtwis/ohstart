import type { OhstartJson, ScriptJson } from "@shared/types"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export interface SourceScript {
  name: string
  path: string
  script?: ScriptJson
  error?: string
}

export async function readOhstartJson(dir: string): Promise<OhstartJson> {
  const raw = await readFile(join(dir, "ohstart.json"), "utf8")

  let meta: OhstartJson
  try {
    meta = JSON.parse(raw) as OhstartJson
  }
  catch {
    throw new Error("ohstart.json is not valid JSON")
  }
  if (!meta.name)
    throw new Error("ohstart.json has no name")

  meta.scripts = meta.scripts ?? {}
  return meta
}

export async function readScriptJson(dir: string, path: string): Promise<ScriptJson> {
  const raw = await readFile(join(dir, path, "script.json"), "utf8")

  let script: ScriptJson
  try {
    script = JSON.parse(raw) as ScriptJson
  }
  catch {
    throw new Error(`script.json in ${path} is not valid JSON`)
  }
  if (!script.name || !script.type || !script.description)
    throw new Error(`invalid script.json in ${path}`)

  return script
}

export async function readSourceScripts(dir: string, meta: OhstartJson): Promise<SourceScript[]> {
  const entries = Object.entries(meta.scripts).sort(([a], [b]) => a.localeCompare(b))
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
