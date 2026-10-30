import { fail, log } from "@shared/logger"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { main } from "@/cli"

export default defineCommand({
  meta: {
    name: "help",
    description: text.description.command.cli.help,
  },
  async run() {
    try {
      const { renderUsage } = await import("citty")
      log.out(await renderUsage(main))
    }
    catch (error) {
      fail(error)
    }
  },
})
