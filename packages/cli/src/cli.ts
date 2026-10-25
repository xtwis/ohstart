#!/usr/bin/env node
import { text } from "@shared/text"
import { defineCommand, runMain } from "citty"
import { subCommands } from "@/commands"
import { VERSION } from "@/version"

export const main = defineCommand({
  meta: {
    name: "ohstart",
    version: VERSION,
    description: text.description.command.cli.cli,
  },
  subCommands,
  default: "help",
})

void runMain(main)
