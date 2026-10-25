import type { ScriptType } from "@shared/types"
import process from "node:process"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { fail, log } from "@shared/logger"
import { bundleScript } from "@shared/runtime/bundle"
import { prepareScript } from "@shared/runtime/prepare"
import { spawnScript } from "@shared/runtime/spawn"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { prepareWorkDir } from "@/run"
import { SDK_URL } from "@/runtime/sdk"
import { findSourceRoot } from "@/source"

const RESERVED_FLAGS = new Set(["--keep", "--no-git"])

export default defineCommand({
  meta: {
    name: "run",
    description: text.description.command.dev.run,
  },
  args: {
    type: {
      type: "positional",
      required: true,
      description: text.description.arg.script.runType,
    },
    script: {
      type: "positional",
      required: true,
      description: text.description.arg.script.runName,
    },
    keep: {
      type: "boolean",
      description: text.description.arg.flag.keep,
    },
    git: {
      type: "boolean",
      default: true,
      description: text.description.arg.flag.git,
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

      const bundle = await bundleScript({ scriptDir, entry: script.entry ?? text.terms.entryFile, sdkUrl: SDK_URL })
      try {
        const workDir = await prepareWorkDir({ root, keep: args.keep === true, git: args.git !== false })
        log.debug(text.debug.workingDirectory(workDir))
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
  throw new Error(text.error.command.invalidScriptType(value))
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
