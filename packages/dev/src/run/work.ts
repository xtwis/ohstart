import type { AgentIdentity, AgentName } from "@shared/agent/types"
import { execFile } from "node:child_process"
import { lstat, mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { promisify } from "node:util"
import { log } from "@shared/logger"
import { resolveInside } from "@shared/path"
import { text } from "@shared/text"
import { x } from "tinyexec"
import { ensureGitignore, GITIGNORE_HEADER, pathExists } from "@/scaffold"

const execFileAsync = promisify(execFile)

export const WORK_DIR = ".ohstart"

export const DEFAULT_AGENT_NAME = "pnpm"

const BUNDLE_FILE = ".ohstart-run.mjs"

const GIT_BRANCH = "main"

const GIT_CONFIG = `[core]
\trepositoryformatversion = 0
\tfilemode = false
\tbare = false
\tlogallrefupdates = true
`

const PNPM_WORKSPACE = `packages: []
`

const PACKAGE_JSON = `{
  "name": "ohstart-work",
  "type": "module"
}
`

const INIT_ARGS: Record<AgentName, string[] | undefined> = {
  pnpm: ["init", "--bare", "--no-init-package-manager"],
  npm: undefined,
  yarn: undefined,
}

export interface WorkDirOptions {
  root: string
  keep: boolean
  git: boolean
  agent: AgentIdentity
}

export function resolveWorkDir(root: string): string {
  const dir = resolveInside(root, WORK_DIR)
  if (!dir)
    throw new Error(text.error.runtime.cannotCreateWorkDir(root))
  return dir
}

export async function prepareWorkDir({ root, keep, git, agent }: WorkDirOptions): Promise<string> {
  const dir = resolveWorkDir(root)

  if (!keep)
    await clearWorkDir(dir)

  await mkdir(dir, { recursive: true })

  const ignored = await ensureGitignore(root, GITIGNORE_HEADER, [WORK_DIR, BUNDLE_FILE])
  if (ignored.length > 0)
    log.debug(text.debug.appendedGitignore(join(root, ".gitignore"), ignored))

  await ensureGitRepo(dir, git)
  await ensurePackageProject(dir, agent)

  return dir
}

async function clearWorkDir(dir: string): Promise<void> {
  const info = await lstat(dir).catch(() => undefined)
  if (!info)
    return
  if (info.isSymbolicLink())
    throw new Error(text.error.runtime.refuseSymlink(dir))
  if (!info.isDirectory())
    throw new Error(text.error.runtime.refuseNotDir(dir))
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
      log.warn(text.warning.gitInitFailed(dir))
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

async function ensurePackageProject(dir: string, agent: AgentIdentity): Promise<void> {
  await ensurePackageManifest(dir, agent)
  await ensurePnpmWorkspace(dir, agent)
}

async function ensurePackageManifest(dir: string, agent: AgentIdentity): Promise<void> {
  if (await pathExists(join(dir, "package.json")))
    return

  const args = INIT_ARGS[agent.name]
  if (args) {
    try {
      const result = await x(agent.name, args, {
        nodeOptions: { cwd: dir, stdio: "inherit" },
      })
      if (result.exitCode === 0)
        return
      log.warn(text.warning.agentInitFailed(dir))
    }
    catch {
      log.warn(text.warning.agentInitFailed(dir))
    }
  }

  await writePackageSkeleton(dir)
}

async function ensurePnpmWorkspace(dir: string, agent: AgentIdentity): Promise<void> {
  if (agent.name !== "pnpm")
    return
  const file = join(dir, "pnpm-workspace.yaml")
  if (await pathExists(file))
    return
  await writeFile(file, PNPM_WORKSPACE, "utf8")
}

async function writePackageSkeleton(dir: string): Promise<void> {
  await writeFile(join(dir, "package.json"), PACKAGE_JSON, "utf8")
}
