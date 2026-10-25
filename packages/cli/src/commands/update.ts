import { text } from "@shared/text"
import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "update",
    description: text.description.command.cli.update,
  },
})
