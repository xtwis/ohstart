import { dirname, join, resolve } from "node:path"
import { pathExists } from "@/scaffold/fs"

export async function findGitRoot(start: string): Promise<string | undefined> {
  let current = resolve(start)
  while (true) {
    if (await pathExists(join(current, ".git")))
      return current
    const parent = dirname(current)
    if (parent === current)
      return
    current = parent
  }
}

export async function findSourceRoot(start: string): Promise<string> {
  const root = await findGitRoot(start)
  if (!root)
    throw new Error(`not inside a git repository: ${resolve(start)}`)
  if (!await pathExists(join(root, "ohstart.json")))
    throw new Error(`no ohstart.json at the git root ${root}, run \`ohsd init\` first`)
  return root
}
