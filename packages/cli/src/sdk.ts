import type { ArgvSchema, DefineArgvResult, NarrowedArgv } from "@ohstart/sdk"

export { log } from "@/logger"
export { prompt } from "@/prompts"

interface RawArgv {
  args: string[]
  flags: Record<string, string | boolean>
}

const rawArgv: RawArgv = { args: [], flags: {} }

export function defineArgv<S extends ArgvSchema>(schema: S): DefineArgvResult<S> {
  return {
    schema,
    getArgv: () => rawArgv as unknown as NarrowedArgv<S>,
  }
}
