import { renderHelp } from "@shared/help"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { main } from "@/cli"

export default defineCommand({
  meta: {
    name: "help",
    description: text.description.command.cli.help,
  },
  async run() {
    await renderHelp(main, main)
  },
})
