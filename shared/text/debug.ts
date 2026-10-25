export const debug = {
  workingDirectory: (dir: string): string => `working directory: ${dir}`,
  appendedGitignore: (file: string, entries: string[]): string => `appended to ${file}: ${entries.join(", ")}`,
} as const
