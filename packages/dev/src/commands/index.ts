import type { SubCommandsDef } from "citty"
import check from "@/commands/check"
import help from "@/commands/help"
import init from "@/commands/init"
import newCommand from "@/commands/new"
import run from "@/commands/run"
import version from "@/commands/version"

export const subCommands = {
  check,
  help,
  init,
  new: newCommand,
  run,
  version,
} satisfies SubCommandsDef
