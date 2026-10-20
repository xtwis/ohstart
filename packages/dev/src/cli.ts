import { defineCommand, runMain } from "citty"
import { subCommands } from "@/commands"
import { VERSION } from "@/version"

export const main = defineCommand({
  meta: {
    name: "ohstart-dev",
    version: VERSION,
    description: "开发 ohstart 源: 创建骨架、校验契约、沙盒试跑",
  },
  subCommands,
  default: "help",
})

void runMain(main)
