import type { Finding } from "@/check/report"
import { stat } from "node:fs/promises"
import { join } from "node:path"
import { resolveInside } from "@shared/path"
import { readScriptJson } from "@shared/read"
import { text } from "@shared/text"
import { errorFinding, toFinding } from "@/check/report"
import { pathExists } from "@/scaffold/fs"

const DEFAULT_ENTRY = text.terms.entryFile
const DEFAULT_ARGV = text.terms.argvFile

export async function checkScript(root: string, key: string, path: string): Promise<Finding[]> {
  const findings: Finding[] = []

  const dir = resolveInside(root, path)
  if (dir === undefined) {
    findings.push(errorFinding(text.error.project.root.pathOutsideSource(path)))
    return findings
  }

  const info = await stat(dir).catch(() => undefined)
  if (!info) {
    findings.push(errorFinding(text.error.project.skeleton.dirMissing(key, path)))
    return findings
  }
  if (!info.isDirectory()) {
    findings.push(errorFinding(text.error.project.skeleton.pathNotDir(key, path)))
    return findings
  }

  let script
  try {
    script = await readScriptJson(root, path)
  }
  catch (error) {
    findings.push(toFinding(error))
    return findings
  }

  if (script.name !== key)
    findings.push(errorFinding(text.error.script.nameMismatch(script.name, key)))

  const entry = script.entry ?? DEFAULT_ENTRY
  if (!await pathExists(join(dir, entry)))
    findings.push(errorFinding(text.error.project.skeleton.entryMissing(key, entry)))

  const argv = script.argv ?? DEFAULT_ARGV
  if (!await pathExists(join(dir, argv)))
    findings.push(errorFinding(text.error.project.skeleton.argvMissing(key, argv)))

  return findings
}
