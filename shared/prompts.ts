import process from "node:process"
import * as clack from "@clack/prompts"
import { text } from "@shared/text"

function requireTty(): void {
  if (!process.stdin.isTTY)
    throw new Error(text.error.runtime.requiresTty)
}

function guard<A extends unknown[], R>(run: (...args: A) => Promise<R | typeof clack.CANCEL_SYMBOL>): (...args: A) => Promise<R> {
  return async (...args) => {
    requireTty()
    const answer = await run(...args)
    if (clack.isCancel(answer)) {
      clack.cancel(text.state.cancelled)
      process.exit(0)
    }
    return answer
  }
}

export const prompt = {
  cancel: clack.cancel,
  confirm: guard(clack.confirm),
  group: clack.group,
  multiselect: guard(clack.multiselect),
  password: guard(clack.password),
  select: guard(clack.select),
  text: guard(clack.text),
}
