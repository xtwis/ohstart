import type { Interface } from "node:readline"
import process from "node:process"
import { createInterface, emitKeypressEvents } from "node:readline"
import { text } from "@shared/text"

export interface Keypress {
  name?: string
  ctrl?: boolean
  sequence?: string
}

const SUBMIT = ["return", "enter"]

export function isSubmit(key: Keypress): boolean {
  return SUBMIT.includes(key.name ?? "")
}

export function isCtrlC(key: Keypress): boolean {
  return key.ctrl === true && key.name === "c"
}

interface Pending {
  resolve: (line: string) => void
  reject: (error: Error) => void
}

interface LineState {
  session: Interface
  queue: string[]
  ended: boolean
  pending?: Pending
}

let state: LineState | undefined

function holdStdin(): void {
  process.stdin.ref?.()
}

function releaseStdin(): void {
  process.stdin.unref?.()
}

function openSession(): LineState {
  const created: LineState = {
    session: undefined as never,
    queue: [],
    ended: false,
  }
  created.session = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY === true,
  })
  created.session.on("line", (line: string) => {
    if (created.pending) {
      const { resolve } = created.pending
      created.pending = undefined
      releaseStdin()
      resolve(line)
      return
    }
    created.queue.push(line)
  })
  created.session.on("close", () => {
    created.ended = true
    releaseStdin()
    if (created.pending) {
      created.pending.reject(new Error(text.error.runtime.stdinClosed))
      created.pending = undefined
    }
  })
  releaseStdin()
  state = created
  return created
}

export function readLine(question: string): Promise<string> {
  const queued = state?.queue.shift()
  if (queued !== undefined) {
    process.stdout.write(`${question}${queued}\n`)
    return Promise.resolve(queued)
  }
  if (state?.ended)
    return Promise.reject(new Error(text.error.runtime.stdinClosed))

  const current = state ?? openSession()
  current.session.setPrompt(question)
  holdStdin()
  current.session.prompt()
  return new Promise((resolve, reject) => {
    current.pending = { resolve, reject }
  })
}

export async function* readKeypresses(): AsyncGenerator<Keypress> {
  if (!process.stdin.isTTY)
    throw new Error(text.error.runtime.requiresTty)

  state?.session.close()
  state = undefined

  const stdin = process.stdin
  emitKeypressEvents(stdin)
  stdin.setRawMode(true)
  stdin.resume()
  holdStdin()

  const queue: Keypress[] = []
  let notify: (() => void) | undefined
  let ended = false

  const onKeypress = (_input: string | undefined, key: Keypress = {}): void => {
    queue.push(key)
    notify?.()
  }
  const onEnd = (): void => {
    ended = true
    notify?.()
  }

  stdin.on("keypress", onKeypress)
  stdin.on("end", onEnd)

  try {
    while (true) {
      if (queue.length === 0) {
        if (ended)
          return
        await new Promise<void>((resolve) => {
          notify = resolve
        })
        notify = undefined
        continue
      }
      const key = queue.shift()
      if (key)
        yield key
    }
  }
  finally {
    stdin.off("keypress", onKeypress)
    stdin.off("end", onEnd)
    stdin.setRawMode(false)
    stdin.pause()
    releaseStdin()
  }
}
