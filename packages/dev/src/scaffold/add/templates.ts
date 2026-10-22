import type { ScriptJson } from "@shared/types"

export const SAMPLE_NAME = "sayhi"

export const ARGV_TS = `import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({})
`

export const INDEX_TS = `import { log } from "@xtwis/ohstart-dev"

export default async function main() {
  log.info("hello from ohstart script")
}
`

export const SAYHI_ARGV_TS = `import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({
  args: [{ name: "name", description: "Name to greet" }],
  flags: { path: { type: "string", description: "Directory to start from (default: cwd)" } },
})
`

export const SAYHI_INDEX_TS = `import argv from "./argv.js"
import { log } from "@xtwis/ohstart-dev"
import { execFile } from "node:child_process"
import { access, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import process from "node:process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const { getArgv } = argv

async function findGitRoot(dir: string): Promise<string | undefined> {
  let current = resolve(dir)
  while (true) {
    try {
      await access(join(current, ".git"))
      return current
    }
    catch {
      const parent = dirname(current)
      if (parent === current)
        return
      current = parent
    }
  }
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

async function nextHelloFile(dir: string): Promise<string> {
  const base = join(dir, "hello.md")
  try {
    await access(base)
  }
  catch {
    return base
  }

  let index = 1
  while (true) {
    const file = join(dir, \`hello(\${index}).md\`)
    try {
      await access(file)
    }
    catch {
      return file
    }
    index++
  }
}

export default async function main() {
  const { args, flags } = getArgv()
  const start = flags.path ?? process.cwd()
  const root = await findGitRoot(start)
  if (!root)
    throw new Error(\`no git repository found from \${start}\`)

  const name = args[0] || await gitUserName() || "developer"
  const file = await nextHelloFile(root)
  await writeFile(file, \`Hi, \${name}!\\n\`, "utf8")
  log.info(\`wrote \${file}\`)
}
`

export function scriptJson(script: ScriptJson): string {
  const body = { name: script.name, type: script.type, description: script.description }
  return `${JSON.stringify(body, null, 2)}\n`
}

export function sampleScript(): ScriptJson {
  return {
    name: SAMPLE_NAME,
    type: "add",
    description: "Sample add script: write hello.md at the git root",
  }
}
