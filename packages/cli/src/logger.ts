import process from "node:process"
import { format } from "node:util"

function write(stream: NodeJS.WriteStream, args: unknown[]): void {
  stream.write(`${format(...args)}\n`)
}

export const log = {
  info: (...args: unknown[]): void => write(process.stdout, args),
  warn: (...args: unknown[]): void => write(process.stderr, args),
  error: (...args: unknown[]): void => write(process.stderr, args),
  debug: (...args: unknown[]): void => {
    if (!process.env.OHSTART_DEBUG)
      return
    write(process.stderr, args)
  },
  fail: (error: unknown): void => {
    write(process.stderr, [error instanceof Error ? error.message : String(error)])
    process.exitCode = 1
  },
}
