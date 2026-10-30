import { S_BAR, S_ERROR, S_INFO, S_STEP_SUBMIT, S_SUCCESS, S_WARN } from "@clack/prompts"
import { blue, close, dim, gray, green, red, yellow } from "@shared/ui/style"

const LEVELS = {
  info: { symbol: S_INFO, paint: blue },
  success: { symbol: S_SUCCESS, paint: green },
  step: { symbol: S_STEP_SUBMIT, paint: green },
  warn: { symbol: S_WARN, paint: yellow },
  error: { symbol: S_ERROR, paint: red },
} as const

function rows(symbol: string, guide: string, body: string): string[] {
  return body.split("\n").map((line, index) => {
    const prefix = index === 0 ? symbol : guide
    return line.length > 0 ? `${prefix}  ${line}` : prefix
  })
}

function level(name: keyof typeof LEVELS, body: string): string {
  const { symbol, paint } = LEVELS[name]
  return close(rows(paint(symbol), gray(S_BAR), body).join("\n"))
}

export const info = (body: string): string => level("info", body)
export const success = (body: string): string => level("success", body)
export const step = (body: string): string => level("step", body)
export const warn = (body: string): string => level("warn", body)
export const error = (body: string): string => level("error", body)

export const message = (body: string): string => close(rows(gray(S_BAR), gray(S_BAR), body).join("\n"))

export const debug = (body: string): string => close(rows(dim(S_BAR), dim(S_BAR), body).join("\n"))

export const blank = (): string => close(gray(S_BAR))
