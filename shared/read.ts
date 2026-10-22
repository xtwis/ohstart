import type { OhstartJson, ScriptJson } from "@shared/types"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { resolveInside } from "@shared/path"

export interface SourceScript {
  name: string
  path: string
  script?: ScriptJson
  error?: string
}

const REQUIRED_SOURCE_FIELDS = ["name", "author", "description"] as const
const REQUIRED_SCRIPT_FIELDS = ["name", "type", "description"] as const
const OPTIONAL_SCRIPT_FIELDS = ["entry", "argv"] as const

const SCRIPT_TYPES = new Set(["init", "add"])

export async function readOhstartJson(dir: string): Promise<OhstartJson> {
  const meta = parseJsonObject(await readFile(join(dir, "ohstart.json"), "utf8"), "ohstart.json")

  assertStringFields(meta, REQUIRED_SOURCE_FIELDS, "ohstart.json")
  if (!meta.name)
    throw new Error("ohstart.json has no name")

  const scripts = meta.scripts
  if (!isPlainObject(scripts))
    throw new Error("ohstart.json: \"scripts\" must be an object")

  const problems: string[] = []
  for (const [name, path] of Object.entries(scripts)) {
    if (name === "")
      problems.push("a script name must not be empty")
    if (typeof path !== "string")
      problems.push(`scripts["${name}"] must be a string`)
  }
  if (problems.length > 0)
    throw new Error(`ohstart.json: ${problems.join(", ")}`)

  return meta as unknown as OhstartJson
}

export async function readScriptJson(dir: string, path: string): Promise<ScriptJson> {
  const label = `script.json in ${path}`
  const scriptDir = resolveInside(dir, path)
  if (!scriptDir)
    throw new Error(`${label}: path is not inside the source`)

  const script = parseJsonObject(await readFile(join(scriptDir, "script.json"), "utf8"), label)

  assertStringFields(script, REQUIRED_SCRIPT_FIELDS, label)
  if (!script.name)
    throw new Error(`${label} has no name`)

  const type = script.type
  if (typeof type === "string" && !SCRIPT_TYPES.has(type))
    throw new Error(`${label}: "type" must be one of init, add, got "${type}"`)

  assertOptionalStringFields(script, OPTIONAL_SCRIPT_FIELDS, label)

  return script as unknown as ScriptJson
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

function parseJsonObject(raw: string, label: string): Record<string, unknown> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  }
  catch {
    throw new Error(`${label} is not valid JSON`)
  }
  if (!isPlainObject(parsed))
    throw new Error(`${label} must be a JSON object`)
  return parsed
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assertStringFields(source: Record<string, unknown>, fields: readonly string[], label: string): void {
  const invalid = fields.filter(field => typeof source[field] !== "string")
  if (invalid.length > 0)
    throw new Error(`${label}: ${invalid.map(field => `"${field}" must be a string`).join(", ")}`)
}

function assertOptionalStringFields(source: Record<string, unknown>, fields: readonly string[], label: string): void {
  const invalid = fields.filter(field => source[field] !== undefined && typeof source[field] !== "string")
  if (invalid.length > 0)
    throw new Error(`${label}: ${invalid.map(field => `"${field}" must be a string`).join(", ")}`)
}
