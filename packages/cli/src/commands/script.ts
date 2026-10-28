import type { ScriptType } from "@shared/types"
import type { CommandDef } from "citty"
import { parseAgentSelection } from "@shared/agent"
import { fail } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { runScript } from "@/runtime"

const RESERVED_TRUST_FLAG = "--trust"

const META: Record<ScriptType, { name: ScriptType, description: string }> = {
  init: { name: "init", description: text.description.command.cli.initScript },
  add: { name: "add", description: text.description.command.cli.addScript },
}

const SCRIPT_ARGS = {
  script: { type: "positional", required: true, description: text.description.arg.script.name },
  trust: { type: "boolean", description: text.description.arg.flag.trust },
  npm: { type: "boolean", description: text.description.arg.agent.npm },
  pnpm: { type: "boolean", description: text.description.arg.agent.pnpm },
  yarn: { type: "boolean", description: text.description.arg.agent.yarn },
  detect: { type: "boolean", default: true, description: text.description.arg.agent.noDetect },
} as const

export function defineScriptCommand(type: ScriptType): CommandDef<typeof SCRIPT_ARGS> {
  return defineCommand({
    meta: META[type],
    args: SCRIPT_ARGS,
    async run({ args, rawArgs }) {
      try {
        const { tokens, trust } = splitTokens(rawArgs, args.script)
        const selection = parseAgentSelection(rawArgs, args.script)
        await runScript({ type, address: args.script, tokens, trust, selection })
      }
      catch (error) {
        fail(error)
      }
    },
  })
}

interface SplitTokens {
  tokens: string[]
  trust: boolean
}

function splitTokens(rawArgs: string[], address: string): SplitTokens {
  const index = rawArgs.indexOf(address)
  if (index === -1)
    return { tokens: [], trust: rawArgs.includes(RESERVED_TRUST_FLAG) }
  return {
    tokens: rawArgs.slice(index + 1),
    trust: rawArgs.slice(0, index).includes(RESERVED_TRUST_FLAG),
  }
}
