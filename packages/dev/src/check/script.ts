import type { Finding } from "@/check/report"
import { stat } from "node:fs/promises"
import { join } from "node:path"
import { resolveInside } from "@shared/path"
import { readScriptJson } from "@shared/read"
import { errorFinding, toFinding } from "@/check/report"
import { pathExists } from "@/scaffold/fs"

const DEFAULT_ENTRY = "index.ts"
const DEFAULT_ARGV = "./argv.ts"

export async function checkScript(root: string, key: string, path: string): Promise<Finding[]> {
  const findings: Finding[] = []

  const dir = resolveInside(root, path)
  if (dir === undefined) {
    findings.push(errorFinding(`script "${key}": path "${path}" is not inside the source`))
    return findings
  }

  const info = await stat(dir).catch(() => undefined)
  if (!info) {
    findings.push(errorFinding(`script "${key}": directory "${path}" does not exist`))
    return findings
  }
  if (!info.isDirectory()) {
    findings.push(errorFinding(`script "${key}": path "${path}" is not a directory`))
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
    findings.push(errorFinding(`script "${key}": script.json declares name "${script.name}"`))

  const entry = script.entry ?? DEFAULT_ENTRY
  if (!await pathExists(join(dir, entry)))
    findings.push(errorFinding(`script "${key}": entry "${entry}" does not exist`))

  const argv = script.argv ?? DEFAULT_ARGV
  if (!await pathExists(join(dir, argv)))
    findings.push(errorFinding(`script "${key}": argv "${argv}" does not exist`))

  return findings
}
