import { terms } from "@shared/text/terms"

export const state = {
  cancelled: "cancelled",
  noSourceConfigured: "no source configured",
  noDefaultSource: `no ${terms.defaultSource}`,
  noScriptInSource: (source: string, type?: string): string =>
    `no ${type ? `${type} ` : ""}${terms.script} in ${terms.source} ${source}`,
  sourceLoaded: (name: string, root: string): string => `${terms.source} ${name} at ${root}`,
  sourceListing: (key: string, name: string): string => `${terms.source} ${key} (${name})`,
  sourceNotLoaded: (root: string): string => `${terms.source} not loaded at ${root}`,
  checkPassed: "check passed",
  checkSummary: (errors: number, warnings: number): string => `${errors} errors, ${warnings} warnings`,
} as const
