import type { SubCommandsDef } from "citty"
import { defineCommand } from "citty"
import add from "@/commands/source/add"
import sourceDefault from "@/commands/source/default"
import list from "@/commands/source/list"
import remove from "@/commands/source/remove"
import trust from "@/commands/source/trust"
import untrust from "@/commands/source/untrust"
import view from "@/commands/source/view"

export const subCommands = {
  add,
  default: sourceDefault,
  list,
  remove,
  trust,
  untrust,
  view,
} satisfies SubCommandsDef

export default defineCommand({
  meta: {
    name: "source",
    description: "管理已配置的 source(源)",
  },
  subCommands,
})
