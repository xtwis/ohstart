import { readdir } from "node:fs/promises"
import { isAbsolute, relative, sep } from "node:path"

const RESERVED_SEGMENTS = new Set([".", ".."])

function isSafeRelativePath(value: string): boolean {
  if (!value || value.includes("\\") || value.includes(":") || value.startsWith("/") || /\s/.test(value))
    return false
  return value.split("/").every(segment => segment !== "" && !RESERVED_SEGMENTS.has(segment))
}

export async function isVacantDir(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir)
    return entries.length === 0
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return true
    throw new Error(`${dir} exists and is not a directory`)
  }
}

export function assertScriptName(name: string): void {
  if (!isSafeRelativePath(name))
    throw new Error(`invalid script name ${name}`)
}

export function assertNotDotPrefixedPath(path: string): void {
  if (path.split("/").some(segment => segment.startsWith(".")))
    throw new Error(`script directory ${path} must not start with a dot: ".ohstart" is reserved for the ohsd run working directory`)
}

export function resolveScriptPath(root: string, target: string): string {
  const fromRoot = relative(root, target)
  if (fromRoot === "")
    throw new Error(`${root} is the source root, create the script in a subdirectory: ohsd new <dir> <name>`)

  const path = fromRoot.split(sep).join("/")
  if (path.startsWith("..") || isAbsolute(path))
    throw new Error(`${target} is not inside the source ${root}`)
  assertNotDotPrefixedPath(path)
  return path
}
