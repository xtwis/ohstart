import type { OhstartJson } from "@shared/types"
import { execFile } from "node:child_process"
import { userInfo } from "node:os"
import { basename, join } from "node:path"
import process from "node:process"
import { promisify } from "node:util"
import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { isVacantDir, pathExists, writeScriptSkeleton } from "@/scaffold"
import { writeSourceJson } from "@/source"

const execFileAsync = promisify(execFile)

const SAMPLE_NAME = "hello"

export default defineCommand({
  meta: {
    name: "init",
    description: "在当前目录创建一个新源骨架(ohstart.json + 示范脚本)",
  },
  args: {
    name: {
      type: "string",
      description: "源名, 默认取当前目录名",
    },
    author: {
      type: "string",
      description: "源作者, 默认取 git user.name",
    },
    description: {
      type: "string",
      description: "源描述",
    },
    sample: {
      type: "boolean",
      default: true,
      description: "生成示范脚本(--no-sample 关闭)",
    },
  },
  async run({ args }) {
    try {
      const root = process.cwd()
      if (await pathExists(join(root, "ohstart.json")))
        throw new Error("already a source here, use `ohsd new <script>`")

      const name = args.name?.trim() || basename(root)
      if (!name)
        throw new Error("source name is required")

      const sample = args.sample
      if (sample && !await isVacantDir(join(root, SAMPLE_NAME)))
        throw new Error(`directory ${SAMPLE_NAME} already exists and is not empty`)

      const meta: OhstartJson = {
        name,
        author: await resolveAuthor(args.author),
        description: args.description?.trim() ?? "",
        scripts: sample ? { [SAMPLE_NAME]: SAMPLE_NAME } : {},
      }

      if (sample)
        await writeScriptSkeleton(join(root, SAMPLE_NAME), { name: SAMPLE_NAME, type: "init", description: "example script" })

      await writeSourceJson(root, meta)

      log.info(`created source ${name}${sample ? ` with sample script ${SAMPLE_NAME}` : ""} in ${root}`)
      if (!await isGitRepo(root))
        log.warn("not a git repository yet: run `git init` before publishing this source")
      log.info("next: git init && git add -A && git commit  |  ohsd new <script> --type add --description \"...\"  |  ohsd check")
    }
    catch (error) {
      fail(error)
    }
  },
})

async function resolveAuthor(explicit?: string): Promise<string> {
  if (explicit?.trim())
    return explicit.trim()
  const fromGit = await gitUserName()
  return fromGit || userInfo().username
}

async function gitUserName(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["config", "user.name"])
    return stdout.trim()
  }
  catch {
    return ""
  }
}

async function isGitRepo(root: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root })
    return stdout.trim() === "true"
  }
  catch {
    return false
  }
}
