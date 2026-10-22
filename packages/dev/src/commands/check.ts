import type { CheckReport, Finding } from "@/check"
import { resolve } from "node:path"
import process from "node:process"
import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { checkDuplicatePaths, checkScript, createReport, errorFinding, findOrphanScripts, loadSource, toFinding } from "@/check"

export default defineCommand({
  meta: {
    name: "check",
    description: "校验源契约完整性",
  },
  args: {
    script: {
      type: "positional",
      required: false,
      description: "只检查指定脚本, 省略则检查整个源",
    },
  },
  async run({ args }) {
    try {
      const report = await runCheck(".", args.script)

      if (report.source)
        log.info(`source ${report.source.name} at ${report.root} (${Object.keys(report.source.scripts).length} scripts registered)`)
      else
        log.info(`source not loaded at ${report.root}`)

      for (const finding of report.findings) {
        const line = `${finding.level === "error" ? "error  " : "warning"} ${finding.message}`
        if (finding.level === "error")
          log.error(line)
        else
          log.warn(line)
      }

      if (report.findings.length === 0) {
        log.info("check passed")
        return
      }
      log.info(`${report.errors} errors, ${report.warnings} warnings`)
      if (!report.ok)
        process.exitCode = 1
    }
    catch (error) {
      fail(error)
    }
  },
})

async function runCheck(start: string, name?: string): Promise<CheckReport> {
  const scoped = name !== undefined

  let root: string
  let meta: Awaited<ReturnType<typeof loadSource>>["meta"]
  try {
    ;({ root, meta } = await loadSource(start))
  }
  catch (error) {
    return createReport(resolve(start), undefined, [toFinding(error)])
  }

  const findings: Finding[] = []

  if (!scoped)
    findings.push(...checkDuplicatePaths(meta))

  const names = scoped
    ? [name as string]
    : Object.keys(meta.scripts).sort((a, b) => a.localeCompare(b))

  for (const key of names) {
    const path = meta.scripts[key]
    if (path === undefined) {
      findings.push(errorFinding(`script "${key}" is not registered in ohstart.json`))
      continue
    }
    findings.push(...await checkScript(root, key, path))
  }

  if (!scoped)
    findings.push(...await findOrphanScripts(root, meta))

  return createReport(root, meta, findings)
}
