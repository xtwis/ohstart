import type { SelectOption } from "@shared/prompts/types"
import process from "node:process"
import { isCtrlC, isSubmit, readKeypresses } from "@shared/prompts/read"

const HIDE_CURSOR = "\u001B[?25l"
const SHOW_CURSOR = "\u001B[?25h"

export async function pick(message: string, options: SelectOption[], multiple: boolean): Promise<number[]> {
  if (options.length === 0)
    throw new Error("no option to select from")
  if (!process.stdin.isTTY)
    throw new Error("interactive prompt requires a tty")

  const chosen = new Set<number>()
  let cursor = 0

  const render = (first: boolean): void => {
    if (!first)
      process.stdout.write(`\u001B[${options.length}A`)
    for (const [index, option] of options.entries()) {
      const marker = multiple ? (chosen.has(index) ? "[x]" : "[ ]") : (index === cursor ? ">" : " ")
      const line = `${marker} ${option.label}`
      const highlighted = index === cursor ? `\u001B[36m${line}\u001B[39m` : line
      process.stdout.write(`\u001B[2K\r${highlighted}\n`)
    }
  }

  process.stdout.write(`${message}\n`)
  process.stdout.write(HIDE_CURSOR)
  render(true)

  try {
    for await (const key of readKeypresses()) {
      if (isCtrlC(key))
        throw new Error("cancelled")
      if (key.name === "up") {
        cursor = (cursor - 1 + options.length) % options.length
      }
      else if (key.name === "down") {
        cursor = (cursor + 1) % options.length
      }
      else if (multiple && key.name === "space") {
        if (chosen.has(cursor))
          chosen.delete(cursor)
        else
          chosen.add(cursor)
      }
      else if (isSubmit(key)) {
        if (!multiple)
          chosen.add(cursor)
        break
      }
      else {
        continue
      }
      render(false)
    }
  }
  finally {
    process.stdout.write(SHOW_CURSOR)
  }

  return [...chosen].sort((a, b) => a - b)
}
