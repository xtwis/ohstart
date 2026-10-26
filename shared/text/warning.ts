import { terms } from "@shared/text/terms"

export const warning = {
  notGitRepo: "not a git repository yet: run `git init` before publishing this source",
  skippingScript: (name: string, reason: string): string => `skipping ${name}: ${reason}`,
  orphanScript: (dir: string): string => `orphan ${dir} has a script.json but is not registered in ohstart.json`,
  gitInitFailed: (dir: string): string => `git init failed in ${dir}, falling back to a minimal git skeleton`,
  pnpmInitFailed: (dir: string): string => `pnpm init failed in ${dir}, falling back to a minimal package manifest`,
  agent: {
    unsupportedDetected: (detected: string, specified: string): string =>
      `detected an unsupported ${terms.packageManager}: ${detected}, using ${specified}`,
    multipleLockFiles: (files: string, specified: string): string =>
      `multiple lock files found: ${files}, using ${specified}`,
  },
} as const
