import type { OhstartJson } from "@shared/types"
import type { Finding } from "@/check/report"
import { readdir } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import { warningFinding } from "@/check/report"
import { pathExists } from "@/scaffold/fs"

const SKIPPED_DIRS = new Set(["node_modules"])

export async function findOrphanScripts(root: string, meta: OhstartJson): Promise<Finding[]> {
  const registered = new Set(Object.values(meta.scripts))
  const findings: Finding[] = []

  for (const dir of await collectScriptDirs(root, root)) {
    if (!registered.has(dir))
      findings.push(warningFinding(`orphan "${dir}" has a script.json but is not registered in ohstart.json`))
  }

  return findings
}

export async function collectScriptDirs(dir: string, root: string): Promise<string[]> {
  const found: string[] = []

  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return found
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || SKIPPED_DIRS.has(entry.name))
      continue

    const child = join(dir, entry.name)
    if (await pathExists(join(child, "script.json")))
      found.push(toPosix(relative(root, child)))
    found.push(...await collectScriptDirs(child, root))
  }

  return found
}

function toPosix(path: string): string {
  return path.split(sep).join("/")
}
