import { defineCommand, runMain } from "citty"
import { subCommands } from "@/commands/index.js"

const main = defineCommand({
  meta: {
    name: "ohstart",
    version: "0.1.0",
    description: "从 source 一键应用项目模板与工具链配置",
  },
  subCommands,
})

void runMain(main)
