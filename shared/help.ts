import type { TableColumn } from "@shared/ui"
import type { ArgsDef, CommandDef, CommandMeta, Resolvable, SubCommandsDef } from "citty"
import { command } from "@shared/command"
import { text } from "@shared/text"
import { resolvePath } from "@shared/tree"
import { ui } from "@shared/ui"

interface HelpRow {
  spec: string
  description: string
}

const columns: TableColumn<HelpRow>[] = [
  { align: "right", render: row => ui.primary(row.spec) },
  { render: row => row.description },
]

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

export async function renderHelp(root: CommandDef<any>, target: CommandDef<any>): Promise<void> {
  const meta = await resolve<CommandMeta>(target.meta)
  const path = await resolvePath(root, target)
  const title = path.length > 0 ? path.join(" ") : (meta?.name ?? "")
  const args: ArgsDef = await resolve<ArgsDef>(target.args) ?? {}

  const positionals: HelpRow[] = []
  const options: HelpRow[] = []
  const usageParts: string[] = []

  for (const [name, arg] of Object.entries(args)) {
    if (arg.type === "positional") {
      const required = arg.required !== false && arg.default === undefined
      positionals.push({ spec: name.toUpperCase(), description: arg.description ?? "" })
      usageParts.push(required ? `<${name.toUpperCase()}>` : `[${name.toUpperCase()}]`)
    }
    else {
      const aliases = "alias" in arg ? toArray(arg.alias) : []
      const spec = [...aliases.map(alias => `-${alias}`), `--${name}`].join(", ")
      options.push({ spec, description: arg.description ?? "" })
      if (arg.required === true && arg.default === undefined)
        usageParts.push(`--${name}`)
    }
  }

  const subs = await resolve<SubCommandsDef>(target.subCommands) ?? {}
  const commands: HelpRow[] = []
  const names: string[] = []

  for (const [name, sub] of Object.entries(subs)) {
    const resolved = await resolve<CommandDef>(sub)
    const subMeta = await resolve<CommandMeta>(resolved?.meta)
    if (subMeta?.hidden)
      continue
    const aliases = toArray(subMeta?.alias)
    commands.push({ spec: [name, ...aliases].join(", "), description: subMeta?.description ?? "" })
    names.push(name, ...aliases)
  }

  const cmd = command()
  cmd.start(title, meta?.description ?? "")

  const usage = [title, options.length > 0 ? "[OPTIONS]" : undefined, ...usageParts, names.length > 0 ? names.join("|") : undefined]
    .filter(Boolean)
    .join(" ")
  cmd.say(`${ui.title(text.label.heading.usage)}  ${ui.primary(usage)}`)

  if (positionals.length > 0)
    cmd.say(`${ui.title(text.label.heading.arguments)}\n${ui.table(positionals, columns)}`)
  if (options.length > 0)
    cmd.say(`${ui.title(text.label.heading.options)}\n${ui.table(options, columns)}`)
  if (commands.length > 0)
    cmd.say(`${ui.title(text.label.heading.commands)}\n${ui.table(commands, columns)}`)

  cmd.finish(text.label.hint.help(title))
}
