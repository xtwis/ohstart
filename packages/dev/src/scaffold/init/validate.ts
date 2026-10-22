import { readdir } from "node:fs/promises"

const IGNORED_ENTRIES = [".git", ".gitignore", ".DS_Store"]
const IGNORED_PREFIXES = ["README", "LICENSE"]

export const IGNORED_ENTRY_HINT = `${IGNORED_ENTRIES.join(", ")} and files starting with ${IGNORED_PREFIXES.join(" or ")} are ignored`

function isIgnorableEntry(entry: string): boolean {
  return IGNORED_ENTRIES.includes(entry) || IGNORED_PREFIXES.some(prefix => entry.startsWith(prefix))
}

export async function isVacantSourceRoot(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir)
    return entries.every(entry => isIgnorableEntry(entry))
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return true
    throw new Error(`${dir} is not a directory`)
  }
}
