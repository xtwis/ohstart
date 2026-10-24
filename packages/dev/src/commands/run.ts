import type { ScriptType } from "@shared/types"
import process from "node:process"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { fail, log } from "@shared/logger"
import { bundleScript } from "@shared/runtime/bundle"
import { prepareScript } from "@shared/runtime/prepare"
import { spawnScript } from "@shared/runtime/spawn"
import { defineCommand } from "citty"
import { prepareWorkDir } from "@/run"
import { SDK_URL } from "@/runtime/sdk"
import { findSourceRoot } from "@/source"

const RESERVED_FLAGS = new Set(["--keep", "--no-git"])

export default defineCommand({
  meta: {
    name: "run",
    description: "在本地源里试跑脚本, 脚本的工作目录是源根下的 .ohstart",
  },
  args: {
    type: {
      type: "positional",
      required: true,
      description: "脚本类型, init 或 add",
    },
    script: {
      type: "positional",
      required: true,
      description: "脚本名, 与 ohstart.json 里注册的键一致",
    },
    keep: {
      type: "boolean",
      description: "保留工作目录已有内容(默认每次运行前清空)",
    },
    git: {
      type: "boolean",
      default: true,
      description: "在工作目录里建 git 仓库, 让向上找 git root 的脚本停在这里; --no-git 表示不调用 git 命令, 直接生成最小仓库骨架",
    },
  },
  async run({ args, rawArgs }) {
    try {
      const type = parseType(args.type)
      const { tokens } = splitTokens(rawArgs, args.script)

      const root = await findSourceRoot(".")
      const { scriptDir, script, schema } = await prepareScript({
        root,
        name: args.script,
        type,
        sdkUrl: SDK_URL,
        command: "ohsd run",
      })

      const argv = parseScriptArgv(tokens, schema)
      await fillRequiredArgs(schema, argv)

      const bundle = await bundleScript({ scriptDir, entry: script.entry ?? "index.ts", sdkUrl: SDK_URL })
      try {
        const workDir = await prepareWorkDir({ root, keep: args.keep === true, git: args.git !== false })
        log.debug(`working directory: ${workDir}`)
        const code = await spawnScript(bundle.file, argv, { cwd: workDir })
        if (code !== 0)
          process.exitCode = code ?? 1
      }
      finally {
        await bundle.dispose()
      }
    }
    catch (error) {
      fail(error)
    }
  },
})

function parseType(value: string): ScriptType {
  if (value === "init" || value === "add")
    return value
  throw new Error(`invalid script type "${value}", expected init or add`)
}

function splitTokens(rawArgs: string[], script: string): { tokens: string[] } {
  const kept: string[] = []
  let afterSeparator = false

  for (const token of rawArgs) {
    if (!afterSeparator && token === "--") {
      afterSeparator = true
      kept.push(token)
      continue
    }
    if (!afterSeparator && RESERVED_FLAGS.has(token))
      continue
    kept.push(token)
  }

  const index = kept.indexOf(script)
  return { tokens: index === -1 ? [] : kept.slice(index + 1) }
}
