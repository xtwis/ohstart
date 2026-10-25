import { readdir } from "node:fs/promises"
import { isAbsolute, relative, sep } from "node:path"
import { text } from "@shared/text"

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
    throw new Error(text.error.project.root.notADirectory(dir))
  }
}

export function assertScriptName(name: string): void {
  if (!isSafeRelativePath(name))
    throw new Error(text.error.project.skeleton.invalidName(name))
}

export function assertNotDotPrefixedPath(path: string): void {
  if (path.split("/").some(segment => segment.startsWith(".")))
    throw new Error(text.error.project.skeleton.dotPrefixed(path))
}

export function resolveScriptPath(root: string, target: string): string {
  const fromRoot = relative(root, target)
  if (fromRoot === "")
    throw new Error(text.error.project.root.isSourceRoot(root))

  const path = fromRoot.split(sep).join("/")
  if (path.startsWith("..") || isAbsolute(path))
    throw new Error(text.error.project.root.pathOutsideSource(target))
  assertNotDotPrefixedPath(path)
  return path
}
