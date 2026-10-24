import { execFile } from "node:child_process"
import { lstat, mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { promisify } from "node:util"
import { log } from "@shared/logger"
import { resolveInside } from "@shared/path"
import { ensureGitignore, GITIGNORE_HEADER, pathExists } from "@/scaffold"

const execFileAsync = promisify(execFile)

export const WORK_DIR = ".ohstart"

const BUNDLE_FILE = ".ohstart-run.mjs"

const GIT_BRANCH = "main"

const GIT_CONFIG = `[core]
\trepositoryformatversion = 0
\tfilemode = false
\tbare = false
\tlogallrefupdates = true
`

export interface WorkDirOptions {
  root: string
  keep: boolean
  git: boolean
}

export async function prepareWorkDir({ root, keep, git }: WorkDirOptions): Promise<string> {
  const dir = resolveInside(root, WORK_DIR)
  if (!dir)
    throw new Error(`cannot create the working directory ${WORK_DIR} inside ${root}`)

  if (!keep)
    await clearWorkDir(dir)

  await mkdir(dir, { recursive: true })

  const ignored = await ensureGitignore(root, GITIGNORE_HEADER, [WORK_DIR, BUNDLE_FILE])
  if (ignored.length > 0)
    log.debug(`appended to ${join(root, ".gitignore")}: ${ignored.join(", ")}`)

  await ensureGitRepo(dir, git)

  return dir
}

async function clearWorkDir(dir: string): Promise<void> {
  const info = await lstat(dir).catch(() => undefined)
  if (!info)
    return
  if (info.isSymbolicLink())
    throw new Error(`refusing to clear ${dir}: it is a symbolic link`)
  if (!info.isDirectory())
    throw new Error(`refusing to clear ${dir}: it is not a directory`)
  await rm(dir, { recursive: true, force: true })
}

async function ensureGitRepo(dir: string, useGitBinary: boolean): Promise<void> {
  if (await pathExists(join(dir, ".git")))
    return

  if (useGitBinary) {
    try {
      await execFileAsync("git", ["init", "--quiet", `--initial-branch=${GIT_BRANCH}`], { cwd: dir })
      return
    }
    catch {
      log.warn(`git init failed in ${dir}, falling back to a minimal git skeleton`)
    }
  }

  await writeGitSkeleton(dir)
}

async function writeGitSkeleton(dir: string): Promise<void> {
  const gitDir = join(dir, ".git")
  await mkdir(join(gitDir, "objects"), { recursive: true })
  await mkdir(join(gitDir, "refs"), { recursive: true })
  await writeFile(join(gitDir, "HEAD"), `ref: refs/heads/${GIT_BRANCH}\n`, "utf8")
  await writeFile(join(gitDir, "config"), GIT_CONFIG, "utf8")
}
