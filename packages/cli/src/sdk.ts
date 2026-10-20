import type { ArgvSchema, DefineArgvResult, NarrowedArgv } from "@ohstart/sdk"
import process from "node:process"

export { log } from "@/logger"
export { prompt } from "@/prompts"

interface RawArgv {
  args: string[]
  flags: Record<string, string | boolean>
}

const EMPTY_ARGV: RawArgv = { args: [], flags: {} }

function readRawArgv(): RawArgv {
  const raw = process.env.OHSTART_ARGV
  if (!raw)
    return EMPTY_ARGV
  try {
    const parsed = JSON.parse(raw) as Partial<RawArgv>
    return { args: parsed.args ?? [], flags: parsed.flags ?? {} }
  }
  catch {
    return EMPTY_ARGV
  }
}

const rawArgv = readRawArgv()

export function defineArgv<S extends ArgvSchema>(schema: S): DefineArgvResult<S> {
  return {
    schema,
    getArgv: () => rawArgv as unknown as NarrowedArgv<S>,
  }
}
