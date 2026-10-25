import { terms } from "@shared/text/terms"

export const success = {
  addedSource: (key: string, url: string, name?: string): string =>
    `added ${terms.source} ${key}${name ? ` (${name})` : ""} -> ${url}`,
  removedSource: (key: string): string => `removed ${terms.source} ${key}`,
  createdSource: (name: string, root: string, sample?: boolean): string =>
    `created ${terms.source} ${name}${sample ? ` with sample ${terms.script}` : ""} in ${root}`,
  createdScript: (name: string, path: string): string => `created ${terms.script} ${name} at ${path}`,
  defaultSourceNow: (key: string): string => `${terms.defaultSource} is now ${key}`,
  sourceTrust: (key: string, trusted: boolean): string =>
    `${terms.source} ${key} is ${trusted ? `now ${terms.trusted}` : `no longer ${terms.trusted}`}`,
} as const
