import { execFile } from "node:child_process"
import { mkdir } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { promisify } from "node:util"
import { command } from "@shared/command"
import { log } from "@shared/logger"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { isVacantSourceRoot, pathExists, writeSourceProject } from "@/scaffold"

const execFileAsync = promisify(execFile)

export default defineCommand({
  meta: {
    name: "init",
    description: text.description.command.dev.init,
  },
  args: {
    dir: {
      type: "positional",
      required: false,
      description: text.description.arg.source.targetDir,
    },
    name: {
      type: "string",
      description: text.description.arg.source.name,
    },
    author: {
      type: "string",
      description: text.description.arg.source.author,
    },
    description: {
      type: "string",
      description: text.description.arg.source.description,
    },
    bare: {
      type: "boolean",
      description: text.description.arg.flag.bare,
    },
  },
  async run({ args }) {
    const cmd = command()
    try {
      cmd.start(text.label.command.devInit, text.description.command.dev.init)

      const root = resolve(args.dir ?? ".")
      if (!await isVacantSourceRoot(root))
        throw new Error(text.error.project.root.notEmpty(root))

      await mkdir(root, { recursive: true })

      const name = args.name?.trim() || basename(root)
      const description = args.description?.trim() ?? ""
      const author = await resolveAuthor(args.author, root)

      const { ignored } = await writeSourceProject({
        root,
        name,
        author,
        description,
        sample: !args.bare,
      })

      cmd.say(text.success.createdSource(name, root, !args.bare))
      if (ignored.length > 0)
        log.debug(ui.debug(text.debug.appendedGitignore(join(root, ".gitignore"), ignored)))
      if (!await pathExists(join(root, ".git")))
        cmd.say(ui.yellow(text.warning.notGitRepo))
      cmd.say(text.next.sourceSteps)
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
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
