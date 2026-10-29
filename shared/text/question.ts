import { terms } from "@shared/text/terms"

export const question = {
  removeSource: (key: string): string => `remove ${terms.source} ${key}?`,
  enterKeyName: (key: string): string => `enter another ${terms.keyName} for ${terms.source} ${key}?`,
  selectScriptType: `select ${terms.script} type?`,
  confirmAgent: (detected: string, source: string, specified: string): string =>
    `detected ${detected} (${source}), use ${specified} instead?`,
  confirmTrust: (key: string, name: string, url: string): string =>
    `${terms.source} ${key} (${name}) is not ${terms.trusted}: ${url}\nsources from this ${terms.source} run arbitrary code, continue?`,
  argRequired: (name: string): string => `${name} is required`,
} as const
