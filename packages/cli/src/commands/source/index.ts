import type { SubCommandsDef } from "citty"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import add from "@/commands/source/add"
import sourceDefault from "@/commands/source/default"
import list from "@/commands/source/list"
import remove from "@/commands/source/remove"
import rename from "@/commands/source/rename"
import trust from "@/commands/source/trust"
import untrust from "@/commands/source/untrust"
import view from "@/commands/source/view"

export const subCommands = {
  add,
  default: sourceDefault,
  list,
  remove,
  rename,
  trust,
  untrust,
  view,
} satisfies SubCommandsDef

export default defineCommand({
  meta: {
    name: "source",
    description: text.description.command.cli.source.manage,
  },
  subCommands,
})
