import process from "node:process"

const CODES = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
} as const

const ALIASES = {
  primary: "cyan",
  muted: "gray",
} as const

function enabled(): boolean {
  const force = process.env.FORCE_COLOR
  if (force !== undefined && force !== "" && force !== "0")
    return true
  if (process.env.NO_COLOR)
    return false
  if (process.env.TERM === "dumb")
    return false
  if (process.env.TEST || process.env.CI)
    return false
  return process.stdout.isTTY === true
}

function paint(name: keyof typeof CODES, text: string): string {
  return wrap(CODES[name], 39, text)
}

function wrap(open: number, end: number, text: string): string {
  if (text.length === 0)
    return ""
  if (!enabled())
    return text
  return `\u001B[${open}m${text}\u001B[${end}m`
}

export function close(block: string): string {
  return block.includes("\u001B[") ? `${block}\u001B[0m` : block
}

export const black = (text: string): string => paint("black", text)
export const red = (text: string): string => paint("red", text)
export const green = (text: string): string => paint("green", text)
export const yellow = (text: string): string => paint("yellow", text)
export const blue = (text: string): string => paint("blue", text)
export const magenta = (text: string): string => paint("magenta", text)
export const cyan = (text: string): string => paint("cyan", text)
export const white = (text: string): string => paint("white", text)
export const gray = (text: string): string => paint("gray", text)

export const primary = (text: string): string => paint(ALIASES.primary, text)
export const muted = (text: string): string => paint(ALIASES.muted, text)

export const bold = (text: string): string => wrap(1, 22, text)
export const underline = (text: string): string => wrap(4, 24, text)
export const dim = (text: string): string => wrap(2, 22, text)

export const title = (text: string): string => underline(bold(text))
export const note = (text: string): string => muted(text)
