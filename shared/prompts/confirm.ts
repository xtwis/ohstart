import type { ConfirmOptions } from "@shared/prompts/types"
import { log } from "@shared/logger"
import { readLine } from "@shared/prompts/read"
import { text } from "@shared/text"

export async function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  const hint = options.default === undefined ? " [y/n]" : options.default ? " [Y/n]" : " [y/N]"
  while (true) {
    const answer = (await readLine(`${message}${hint} `)).trim().toLowerCase()
    if (answer === "") {
      if (options.default !== undefined)
        return options.default
    }
    else if (answer === "y" || answer === "yes") {
      return true
    }
    else if (answer === "n" || answer === "no") {
      return false
    }
    log.error(text.question.answerYesNo)
  }
}
