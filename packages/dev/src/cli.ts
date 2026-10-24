#!/usr/bin/env node
import { defineCommand, runMain } from "citty"
import { subCommands } from "@/commands"
import { VERSION } from "@/version"

export const main = defineCommand({
  meta: {
    name: "ohstart-dev",
    version: VERSION,
    description: "开发 ohstart 源: 创建骨架、校验契约、试跑脚本",
  },
  subCommands,
  default: "help",
})

void runMain(main)
