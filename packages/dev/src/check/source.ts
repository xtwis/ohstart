import type { OhstartJson } from "@shared/types"
import type { Finding } from "@/check/report"
import { readOhstartJson } from "@shared/read"
import { text } from "@shared/text"
import { errorFinding } from "@/check/report"
import { findSourceRoot } from "@/source/root"

export interface LoadedSource {
  root: string
  meta: OhstartJson
}

export async function loadSource(start: string): Promise<LoadedSource> {
  const root = await findSourceRoot(start)
  return { root, meta: await readOhstartJson(root) }
}

export function checkDuplicatePaths(meta: OhstartJson): Finding[] {
  const findings: Finding[] = []
  const owners = new Map<string, string>()

  for (const [key, path] of Object.entries(meta.scripts)) {
    const owner = owners.get(path)
    if (owner === undefined)
      owners.set(path, key)
    else
      findings.push(errorFinding(text.error.project.skeleton.pathUsed(path, owner)))
  }

  return findings
}
