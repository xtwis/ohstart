import type { ScriptType } from "@shared/types"
import type { CommandDef } from "citty"
import type { AgentSelection } from "@/runtime/agent"
import { isAgentName } from "@shared/agent/identity"
import { fail } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { runScript } from "@/runtime"

const RESERVED_TRUST_FLAG = "--trust"
const RESERVED_AGENT_FLAG = "--agent"
const RESERVED_NO_DETECT_FLAG = "--no-detect"

const AGENT_FLAGS = {
  "--npm": "npm",
  "--pnpm": "pnpm",
  "--yarn": "yarn",
} as const

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
        const { tokens, trust, selection } = splitTokens(rawArgs, args.script)
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
  selection: AgentSelection
}

function splitTokens(rawArgs: string[], address: string): SplitTokens {
  const kept: string[] = []
  const sources: string[] = []
  const selection: AgentSelection = { name: undefined, noDetect: false }
  let trust = false
  let afterSeparator = false

  const addressIndex = rawArgs.indexOf(address)
  const head = addressIndex === -1 ? rawArgs.length : addressIndex

  for (const [index, token] of rawArgs.entries()) {
    if (!afterSeparator && token === "--") {
      afterSeparator = true
      kept.push(token)
      continue
    }
    if (!afterSeparator && token === RESERVED_TRUST_FLAG) {
      trust = true
      continue
    }
    if (!afterSeparator && index < head) {
      const picked = pickAgentFlag(token, selection, sources)
      if (picked)
        continue
    }
    kept.push(token)
  }

  if (sources.length > 1)
    throw new Error(text.error.agent.multipleSpecified(sources.join(", ")))

  const index = kept.indexOf(address)
  return { tokens: index === -1 ? [] : kept.slice(index + 1), trust, selection }
}

function pickAgentFlag(token: string, selection: AgentSelection, sources: string[]): boolean {
  if (token === RESERVED_NO_DETECT_FLAG) {
    selection.noDetect = true
    return true
  }
  if (token === RESERVED_AGENT_FLAG)
    throw new Error(text.error.agent.missingAgentValue)
  if (token.startsWith(`${RESERVED_AGENT_FLAG}=`)) {
    const value = token.slice(RESERVED_AGENT_FLAG.length + 1)
    if (!value)
      throw new Error(text.error.agent.missingAgentValue)
    if (!isAgentName(value))
      throw new Error(text.error.agent.invalidAgent(value))
    sources.push(token)
    selection.name = value
    return true
  }
  const name = AGENT_FLAGS[token as keyof typeof AGENT_FLAGS]
  if (name) {
    sources.push(token)
    selection.name = name
    return true
  }
  return false
}
