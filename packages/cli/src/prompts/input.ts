import type { InputOptions } from "@/prompts/types"
import { log } from "@/logger"
import { readLine } from "@/prompts/read"

export async function input(message: string, options: InputOptions = {}): Promise<string> {
  const hint = options.default === undefined ? "" : ` (${options.default})`
  while (true) {
    const answer = (await readLine(`${message}${hint} `)).trim()
    const value = answer === "" ? options.default ?? "" : answer
    const verdict = options.validate?.(value) ?? true
    if (verdict === true)
      return value
    log.error(verdict)
  }
}
