import process from "node:process"
import { format } from "node:util"

function write(stream: NodeJS.WriteStream, args: unknown[]): void {
  stream.write(`${format(...args)}\n`)
}

export const log = {
  out: (...args: unknown[]): void => write(process.stdout, args),
  error: (...args: unknown[]): void => write(process.stderr, args),
  debug: (...args: unknown[]): void => {
    if (!process.env.OHSTART_DEBUG)
      return
    write(process.stderr, args)
  },
}

export function fail(error: unknown): void {
  log.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
