import { execFile } from "node:child_process"
import { mkdir } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { promisify } from "node:util"
import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { isEmptyDirOrGit, pathExists, SAMPLE_NAME, writeSampleScript } from "@/scaffold"
import { writeSourceJson } from "@/source"

const execFileAsync = promisify(execFile)

export default defineCommand({
  meta: {
    name: "init",
    description: "创建一个新源骨架(ohstart.json + 示例脚本)",
  },
  args: {
    dir: {
      type: "positional",
      required: false,
      description: "目标目录, 默认当前目录",
    },
    name: {
      type: "string",
      description: "源名, 默认取目标目录名",
    },
    author: {
      type: "string",
      description: "源作者, 默认取 git user.name",
    },
    description: {
      type: "string",
      description: "源描述",
    },
    bare: {
      type: "boolean",
      description: "只生成 ohstart.json, 不生成示例脚本",
    },
  },
  async run({ args }) {
    try {
      const root = resolve(args.dir ?? ".")
      if (!await isEmptyDirOrGit(root))
        throw new Error(`${root} is not empty, init needs an empty directory or an empty git repository`)

      await mkdir(root, { recursive: true })

      const name = args.name?.trim() || basename(root)
      const description = args.description?.trim() ?? ""
      const author = await resolveAuthor(args.author, root)
      const sample = SAMPLE_NAME

      if (!args.bare)
        await writeSampleScript(root)

      await writeSourceJson(root, {
        name,
        author,
        description,
        scripts: args.bare ? {} : { [sample]: sample },
      })

      log.info(`created source ${name}${args.bare ? "" : ` with sample script ${sample}`} in ${root}`)
      if (!await pathExists(join(root, ".git")))
        log.warn("not a git repository yet: run `git init` before publishing this source")
      log.info("next: git init && git add -A && git commit  |  ohsd new <dir> --type add  |  ohsd check")
    }
    catch (error) {
      fail(error)
    }
  },
})

async function resolveAuthor(explicit: string | undefined, cwd: string): Promise<string> {
  if (explicit?.trim())
    return explicit.trim()
  return gitUserName(cwd)
}

async function gitUserName(cwd: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["config", "user.name"], { cwd })
    return stdout.trim()
  }
  catch {
    return ""
  }
}
