import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { BUILD_DATE, PACKAGE, VERSION } from "@/meta"

export default defineCommand({
  meta: {
    name: "version",
    alias: "ver",
    description: text.description.command.dev.version,
  },
  run() {
    const cmd = command()
    cmd.start(text.label.command.devVersion, text.description.command.dev.version)
    cmd.say(ui.primary(PACKAGE))
    cmd.say(`v${VERSION}  ${BUILD_DATE.slice(0, 10)}`)
    cmd.finish()
  },
})
