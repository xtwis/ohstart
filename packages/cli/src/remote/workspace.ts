import { execFile } from "node:child_process"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export interface SourceWorkspace {
  dir: string
  dispose: () => Promise<void>
}

export async function cloneSource(url: string): Promise<SourceWorkspace> {
  const dir = await mkdtemp(join(tmpdir(), "ohstart-"))
  try {
    await execFileAsync("git", ["clone", "--depth", "1", "--quiet", url, dir])
  }
  catch (error) {
    await disposeSource(dir)
    const stderr = (error as { stderr?: string }).stderr
    throw new Error(`failed to clone ${url}${stderr ? `\n${stderr.trim()}` : ""}`)
  }
  return { dir, dispose: () => disposeSource(dir) }
}

export async function disposeSource(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}
