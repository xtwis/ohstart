import { terms } from "@shared/text/terms"

export const question = {
  removeSource: (key: string): string => `remove ${terms.source} ${key}?`,
  enterKeyName: (key: string): string => `enter another ${terms.keyName} for ${terms.source} ${key}?`,
  selectScriptType: `select ${terms.script} type?`,
  confirmTrust: (key: string, name: string, url: string): string =>
    `${terms.source} ${key} (${name}) is not ${terms.trusted}: ${url}\nsources from this ${terms.source} run arbitrary code, continue?`,
  answerYesNo: "please answer y or n",
  argRequired: (name: string): string => `${name} is required`,
} as const
