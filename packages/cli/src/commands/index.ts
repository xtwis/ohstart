import type { SubCommandsDef } from "citty"
import add from "@/commands/add"
import help from "@/commands/help"
import init from "@/commands/init"
import list from "@/commands/list"
import source from "@/commands/source"
import version from "@/commands/version"
import view from "@/commands/view"

export const subCommands = {
  add,
  help,
  init,
  list,
  source,
  version,
  view,
} satisfies SubCommandsDef
