export const warning = {
  notGitRepo: "not a git repository yet: run `git init` before publishing this source",
  skippingScript: (name: string, reason: string): string => `skipping ${name}: ${reason}`,
  orphanScript: (dir: string): string => `orphan ${dir} has a script.json but is not registered in ohstart.json`,
  gitInitFailed: (dir: string): string => `git init failed in ${dir}, falling back to a minimal git skeleton`,
} as const
