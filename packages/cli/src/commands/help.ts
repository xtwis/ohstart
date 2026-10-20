import { fail, log } from "@shared/logger"
import { defineCommand } from "citty"
import { main } from "@/main"

export default defineCommand({
  meta: {
    name: "help",
    description: "显示帮助",
  },
  async run() {
    try {
      const { renderUsage } = await import("citty")
      log.info(await renderUsage(main))
    }
    catch (error) {
      fail(error)
    }
  },
})
