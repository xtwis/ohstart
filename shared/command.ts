import process from "node:process"
import { S_BAR, S_BAR_START, S_INFO, S_STEP_SUBMIT } from "@clack/prompts"
import { log } from "@shared/logger"
import { text } from "@shared/text"
import { ui } from "@shared/ui"

export interface Command {
  start: (title: string, description: string) => void
  say: (content: string) => void
  step: <T>(run: () => Promise<T>) => Promise<T>
  finish: (footer?: string) => void
  fail: (error: unknown) => void
}

type State = "idle" | "started" | "finished"

export function commandError(title: string, description: string, error: unknown): void {
  const cmd = command()
  cmd.start(title, description)
  cmd.fail(error)
}

export function command(): Command {
  let state: State = "idle"
  let pending = false

  function writeSeparator(write: (line: string) => void): void {
    if (!pending)
      return
    pending = false
    write(ui.gray(S_BAR))
  }

  function writeContent(content: string): void {
    const lines = content.split("\n").map((line, index) => {
      const prefix = index === 0 ? ui.muted(S_STEP_SUBMIT) : ui.gray(S_BAR)
      return line.length > 0 ? `${prefix}  ${line}` : prefix
    })
    log.out(lines.join("\n"))
  }

  function writeEnd(write: (line: string) => void, label: string | undefined, failed: boolean): void {
    const body = label === undefined ? S_INFO : `${S_INFO}  ${label}`
    write(failed ? ui.red(body) : body)
  }

  function requireStarted(): void {
    if (state === "idle")
      throw new Error(text.error.output.notStarted)
    if (state === "finished")
      throw new Error(text.error.output.alreadyFinished)
  }

  return {
    start(title: string, description: string): void {
      if (state === "started")
        throw new Error(text.error.output.alreadyStarted)
      if (state === "finished")
        throw new Error(text.error.output.alreadyFinished)

      state = "started"
      log.out("")
      log.out(ui.title(title))
      log.out(`${ui.gray(S_BAR_START)}  ${ui.note(description)}`)
      pending = true
    },

    say(content: string): void {
      requireStarted()
      writeSeparator(log.out)
      writeContent(content)
      pending = true
    },

    async step<T>(run: () => Promise<T>): Promise<T> {
      requireStarted()
      pending = false
      const result = await run()
      pending = true
      return result
    },

    finish(footer?: string): void {
      requireStarted()
      writeSeparator(log.out)
      writeEnd(log.out, footer, false)
      log.out("")
      state = "finished"
    },

    fail(error: unknown): void {
      requireStarted()
      writeSeparator(log.error)
      const message = error instanceof Error ? error.message : String(error)
      writeEnd(log.error, message === "" ? undefined : message, true)
      log.error("")
      process.exitCode = 1
      state = "finished"
    },
  }
}
