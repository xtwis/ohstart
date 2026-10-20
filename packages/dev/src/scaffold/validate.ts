const RESERVED_SEGMENTS = new Set([".", ".."])

function isSafeRelativePath(value: string): boolean {
  if (!value || value.includes("\\") || value.includes(":") || value.startsWith("/") || /\s/.test(value))
    return false
  return value.split("/").every(segment => segment !== "" && !RESERVED_SEGMENTS.has(segment))
}

export function assertScriptName(name: string): void {
  if (!isSafeRelativePath(name))
    throw new Error(`invalid script name ${name}`)
}

export function assertScriptPath(path: string): void {
  if (!isSafeRelativePath(path))
    throw new Error(`invalid script path ${path}`)
}
