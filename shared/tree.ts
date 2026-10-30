import type { ArgsDef, CommandDef, CommandMeta, Resolvable, SubCommandsDef } from "citty"

export interface RouteTarget {
  cmd: CommandDef<any>
  path: string[]
  description?: string
  unknown?: string
}

async function resolve<T>(value: Resolvable<T> | undefined): Promise<T | undefined> {
  if (value === undefined)
    return undefined
  if (typeof value === "function")
    return (value as () => T | Promise<T>)()
  return value
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined)
    return []
  return Array.isArray(value) ? value : [value]
}

function camelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
}

function isValueFlag(flag: string, argsDef: ArgsDef): boolean {
  const name = flag.replace(/^-{1,2}/, "")
  const normalized = camelCase(name)
  for (const [key, def] of Object.entries(argsDef)) {
    if (def.type !== "string" && def.type !== "enum")
      continue
    if (normalized === camelCase(key))
      return true
    if ("alias" in def && toArray(def.alias).includes(name))
      return true
  }
  return false
}

function findToken(args: string[], argsDef: ArgsDef): { value: string, index: number } | undefined {
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === "--")
      return undefined
    if (arg.startsWith("-")) {
      if (!arg.includes("=") && isValueFlag(arg, argsDef))
        index++
      continue
    }
    return { value: arg, index }
  }
  return undefined
}

async function findSubCommand(subs: SubCommandsDef, name: string): Promise<CommandDef<any> | undefined> {
  if (name in subs)
    return await resolve<CommandDef<any>>(subs[name])
  for (const sub of Object.values(subs)) {
    const resolved = await resolve<CommandDef<any>>(sub)
    const meta = await resolve<CommandMeta>(resolved?.meta)
    if (toArray(meta?.alias).includes(name))
      return resolved
  }
  return undefined
}

export async function resolvePath(cmd: CommandDef<any>, target: CommandDef<any>, prefix: string[] = []): Promise<string[]> {
  const meta = await resolve<CommandMeta>(cmd.meta)
  const current = meta?.name ? [...prefix, meta.name] : prefix
  if (cmd === target)
    return current

  const subs = await resolve<SubCommandsDef>(cmd.subCommands)
  if (!subs)
    return []

  for (const sub of Object.values(subs)) {
    const resolved = await resolve<CommandDef<any>>(sub)
    if (!resolved)
      continue
    const found = await resolvePath(resolved, target, current)
    if (found.length > 0)
      return found
  }

  return []
}

export async function resolveRoute(root: CommandDef<any>, rawArgs: string[]): Promise<RouteTarget> {
  let current = root
  let path: string[] = []
  let rest = [...rawArgs]

  while (true) {
    const meta = await resolve<CommandMeta>(current.meta)
    path = meta?.name ? [...path, meta.name] : path
    const description = meta?.description

    const subs = await resolve<SubCommandsDef>(current.subCommands)
    if (!subs || Object.keys(subs).length === 0)
      return { cmd: current, path, description }

    const token = findToken(rest, await resolve<ArgsDef>(current.args) ?? {})
    if (!token)
      return { cmd: current, path, description }

    const found = await findSubCommand(subs, token.value)
    if (!found)
      return { cmd: current, path, description, unknown: token.value }

    current = found
    rest = rest.slice(token.index + 1)
  }
}

export function hasHelpFlag(rawArgs: string[]): boolean {
  return rawArgs.some(arg => arg === "--help" || arg === "-h")
}
