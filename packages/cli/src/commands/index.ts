import type { SubCommandsDef } from "citty"
import add from "@/commands/add.js"
import help from "@/commands/help.js"
import init from "@/commands/init.js"
import list from "@/commands/list.js"
import source from "@/commands/source/index.js"
import update from "@/commands/update.js"
import version from "@/commands/version.js"
import view from "@/commands/view.js"

export const subCommands = {
  add,
  help,
  init,
  list,
  source,
  update,
  version,
  view,
} satisfies SubCommandsDef
