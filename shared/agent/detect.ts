import type { AgentName } from "@shared/agent/types"
import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { parseAgent } from "@shared/agent/identity"

export interface DetectedAgent {
  name: AgentName
  version?: string
  source: string
}

export type DetectResult
  = | { type: "found", agent: DetectedAgent }
    | { type: "none" }
    | { type: "conflict", files: string[] }
    | { type: "unsupported", name: string }

interface LockEntry {
  name: string
  files: string[]
}

const LOCK_FILES: LockEntry[] = [
  { name: "npm", files: ["package-lock.json", "npm-shrinkwrap.json"] },
  { name: "pnpm", files: ["pnpm-lock.yaml"] },
  { name: "yarn", files: ["yarn.lock"] },
]

const UNSUPPORTED_LOCK_FILES: LockEntry[] = [
  { name: "bun", files: ["bun.lockb", "bun.lock"] },
  { name: "deno", files: ["deno.lock"] },
]

export function detectAgent(cwd: string): DetectResult {
  let dir = resolve(cwd)
  const stop = resolve(homedir())
  while (true) {
    const result = detectInDir(dir)
    if (result.type !== "none")
      return result
    if (dir === stop)
      return { type: "none" }
    const parent = dirname(dir)
    if (parent === dir)
      return { type: "none" }
    dir = parent
  }
}

function detectInDir(dir: string): DetectResult {
  const manifest = readManifest(dir)
  if (manifest) {
    const declared = manifest.packageManager ?? manifest.devEngines?.packageManager
    const field = declared === undefined ? undefined : formatDeclaration(declared)
    if (field) {
      const parsed = parseAgent(field)
      if (!parsed)
        return { type: "unsupported", name: field }
      return {
        type: "found",
        agent: {
          name: parsed.name,
          version: parsed.version,
          source: manifest.packageManager ? "package.json#packageManager" : "package.json#devEngines.packageManager",
        },
      }
    }
  }

  const unsupported = UNSUPPORTED_LOCK_FILES.find(entry => entry.files.some(file => existsSync(join(dir, file))))
  if (unsupported)
    return { type: "unsupported", name: unsupported.name }

  const locks: string[] = []
  const owners: string[] = []
  for (const entry of LOCK_FILES) {
    const file = entry.files.find(name => existsSync(join(dir, name)))
    if (file) {
      locks.push(file)
      owners.push(entry.name)
    }
  }
  if (owners.length > 1)
    return { type: "conflict", files: locks }
  if (owners.length === 1)
    return { type: "found", agent: { name: owners[0] as AgentName, source: locks[0] } }
  return { type: "none" }
}

function readManifest(dir: string): { packageManager?: string, devEngines?: { packageManager?: unknown } } | undefined {
  const file = join(dir, "package.json")
  if (!existsSync(file))
    return undefined
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as {
      packageManager?: unknown
      devEngines?: { packageManager?: unknown }
    }
    return {
      packageManager: typeof parsed.packageManager === "string" ? parsed.packageManager : undefined,
      devEngines: parsed.devEngines,
    }
  }
  catch {
    return undefined
  }
}

function formatDeclaration(declared: unknown): string | undefined {
  if (typeof declared === "string")
    return declared
  if (declared && typeof declared === "object") {
    const value = declared as { name?: unknown, version?: unknown }
    if (typeof value.name !== "string")
      return undefined
    return typeof value.version === "string" ? `${value.name}@${value.version}` : value.name
  }
  return undefined
}
