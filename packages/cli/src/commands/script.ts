import type { ScriptType } from "@shared/types"
import type { CommandDef } from "citty"
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
} as const

export function defineScriptCommand(type: ScriptType): CommandDef<typeof SCRIPT_ARGS> {
  return defineCommand({
    meta: META[type],
    args: SCRIPT_ARGS,
    async run({ args, rawArgs }) {
      try {
        const { tokens, trust } = splitTokens(rawArgs, args.script)
        await runScript({ type, address: args.script, tokens, trust })
      }
      catch (error) {
        fail(error)
      }
    },
  })
}

function splitTokens(rawArgs: string[], address: string): { tokens: string[], trust: boolean } {
  const kept: string[] = []
  let trust = false
  let afterSeparator = false

  for (const token of rawArgs) {
    if (!afterSeparator && token === "--") {
      afterSeparator = true
      kept.push(token)
      continue
    }
    if (!afterSeparator && token === RESERVED_TRUST_FLAG) {
      trust = true
      continue
    }
    kept.push(token)
  }

  const index = kept.indexOf(address)
  return { tokens: index === -1 ? [] : kept.slice(index + 1), trust }
}
