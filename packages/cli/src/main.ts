import { defineCommand } from "citty"
import { subCommands } from "@/commands"
import { VERSION } from "@/version"

export const main = defineCommand({
  meta: {
    name: "ohstart",
    version: VERSION,
    description: "从 source 一键应用项目模板与工具链配置",
  },
  subCommands,
  default: "help",
})
