import type { ScriptType } from "@ohstart/sdk"
import type { CommandDef } from "citty"
import { defineCommand } from "citty"
import { log } from "@/logger"
import { runScript } from "@/runtime"

const RESERVED_TRUST_FLAG = "--trust"

const META: Record<ScriptType, { name: ScriptType, description: string }> = {
  init: { name: "init", description: "在新项目里执行 init 类脚本" },
  add: { name: "add", description: "向已有项目叠加 add 类脚本" },
}

const SCRIPT_ARGS = {
  script: { type: "positional", required: true, description: "脚本名, 支持 @<key>/<name>" },
  trust: { type: "boolean", description: "单次跳过信任确认(不写回信任标记)" },
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
        log.fail(error)
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
