import type { OhstartJson } from "@shared/types"

export type FindingLevel = "error" | "warning"

export interface Finding {
  level: FindingLevel
  message: string
}

export interface CheckReport {
  root: string
  source?: OhstartJson
  findings: Finding[]
  errors: number
  warnings: number
  ok: boolean
}

export function errorFinding(message: string): Finding {
  return { level: "error", message }
}

export function warningFinding(message: string): Finding {
  return { level: "warning", message }
}

export function toFinding(error: unknown): Finding {
  return errorFinding(error instanceof Error ? error.message : String(error))
}

export function createReport(root: string, source: OhstartJson | undefined, findings: Finding[]): CheckReport {
  const errors = findings.filter(finding => finding.level === "error").length
  return {
    root,
    source,
    findings,
    errors,
    warnings: findings.length - errors,
    ok: errors === 0,
  }
}
