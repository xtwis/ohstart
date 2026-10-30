#!/usr/bin/env node
import process from "node:process"
import { commandError } from "@shared/command"
import { renderHelp } from "@shared/help"
import { text } from "@shared/text"
import { hasHelpFlag, resolveRoute } from "@shared/tree"
import { defineCommand, runMain } from "citty"
import { subCommands } from "@/commands"
import { VERSION } from "@/meta"

export const main = defineCommand({
  meta: {
    name: "ohstart",
    version: VERSION,
    description: text.description.command.cli.cli,
  },
  subCommands,
  default: "help",
})

void run()

async function run(): Promise<void> {
  const rawArgs = process.argv.slice(2)
  if (!hasHelpFlag(rawArgs)) {
    const route = await resolveRoute(main, rawArgs)
    if (route.unknown) {
      commandError(route.path.join(" "), route.description ?? "", new Error(text.error.command.unknownCommand(route.unknown)))
      return
    }
  }
  await runMain(main, { showUsage: cmd => renderHelp(main, cmd) })
}
