import type { SubCommandsDef } from "citty"
import { defineCommand } from "citty"
import add from "@/commands/source/add.js"
import sourceDefault from "@/commands/source/default.js"
import list from "@/commands/source/list.js"
import remove from "@/commands/source/remove.js"
import view from "@/commands/source/view.js"

export const subCommands = {
  add,
  default: sourceDefault,
  list,
  remove,
  view,
} satisfies SubCommandsDef

export default defineCommand({
  meta: {
    name: "source",
    description: "管理已配置的 source(源)",
  },
  subCommands,
})
