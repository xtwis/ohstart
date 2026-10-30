import type { CheckReport, Finding } from "@/check"
import { resolve } from "node:path"
import process from "node:process"
import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { checkDuplicatePaths, checkScript, createReport, errorFinding, findOrphanScripts, loadSource, toFinding } from "@/check"

export default defineCommand({
  meta: {
    name: "check",
    description: text.description.command.dev.check,
  },
  args: {
    script: {
      type: "positional",
      required: false,
      description: text.description.arg.script.checkName,
    },
  },
  async run({ args }) {
    try {
      const report = await runCheck(".", args.script)

      if (report.source)
        log.out(`${text.state.sourceLoaded(report.source.name, report.root)} (${Object.keys(report.source.scripts).length} ${text.label.field.scriptsRegistered})`)
      else
        log.out(text.state.sourceNotLoaded(report.root))

      for (const finding of report.findings) {
        const line = finding.level === "error" ? `${text.label.mark.severityError}  ${finding.message}` : `${text.label.mark.severityWarning} ${finding.message}`
        log.error(line)
      }

      if (report.findings.length === 0) {
        log.out(text.state.checkPassed)
        return
      }
      log.out(text.state.checkSummary(report.errors, report.warnings))
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
      findings.push(errorFinding(text.error.project.skeleton.notRegistered(key)))
      continue
    }
    findings.push(...await checkScript(root, key, path))
  }

  if (!scoped)
    findings.push(...await findOrphanScripts(root, meta))

  return createReport(root, meta, findings)
}
