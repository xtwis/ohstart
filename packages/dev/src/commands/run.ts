import type { ScriptType } from "@shared/types"
import process from "node:process"
import { parseAgentSelection, resolveAgent } from "@shared/agent"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { command } from "@shared/command"
import { log } from "@shared/logger"
import { bundleScript } from "@shared/runtime/bundle"
import { prepareScript } from "@shared/runtime/prepare"
import { spawnScript } from "@shared/runtime/spawn"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { DEFAULT_AGENT_NAME, prepareWorkDir, resolveWorkDir } from "@/run"
import { SDK_URL } from "@/runtime/sdk"
import { findSourceRoot } from "@/source"

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
    npm: {
      type: "boolean",
      description: text.description.arg.agent.npm,
    },
    pnpm: {
      type: "boolean",
      description: text.description.arg.agent.pnpm,
    },
    yarn: {
      type: "boolean",
      description: text.description.arg.agent.yarn,
    },
    detect: {
      type: "boolean",
      default: true,
      description: text.description.arg.agent.noDetect,
    },
  },
  async run({ args, rawArgs }) {
    const cmd = command()
    try {
      cmd.start(text.label.command.devRun, text.description.command.dev.run)

      const type = parseType(args.type)
      const { tokens } = splitTokens(rawArgs, args.script)
      const selection = parseAgentSelection(rawArgs, args.script)

      const root = await findSourceRoot(".")
      const agent = await resolveAgent({
        selection,
        cwd: resolveWorkDir(root),
        fallback: DEFAULT_AGENT_NAME,
      })

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
        const workDir = await prepareWorkDir({ root, keep: args.keep === true, git: args.git !== false, agent })
        log.debug(ui.debug(text.debug.workingDirectory(workDir)))
        const code = await spawnScript(bundle.file, argv, { cwd: workDir, agent })
        if (code !== 0)
          process.exitCode = code ?? 1
      }
      finally {
        await bundle.dispose()
      }

      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})

function parseType(value: string): ScriptType {
  if (value === "init" || value === "add")
    return value
  throw new Error(text.error.command.invalidScriptType(value))
}

function splitTokens(rawArgs: string[], script: string): { tokens: string[] } {
  const index = rawArgs.indexOf(script)
  return { tokens: index === -1 ? [] : rawArgs.slice(index + 1) }
}
