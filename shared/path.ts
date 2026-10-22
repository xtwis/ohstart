import { isAbsolute, relative, resolve, sep } from "node:path"

export function resolveInside(root: string, path: string): string | undefined {
  if (typeof path !== "string" || !path)
    return undefined

  const dir = resolve(root, path)
  const fromRoot = relative(root, dir)

  if (fromRoot === "" || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot))
    return undefined
  return dir
}
