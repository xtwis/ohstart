import { command } from "@shared/command"
import { text } from "@shared/text"
import { ui } from "@shared/ui"
import { defineCommand } from "citty"
import { loadConfig, saveConfig } from "@/config"

export default defineCommand({
  meta: {
    name: "note",
    description: text.description.command.cli.source.note,
  },
  args: {
    keyName: {
      type: "positional",
      required: true,
      description: text.description.arg.source.keyName,
    },
    note: {
      type: "positional",
      required: false,
      description: text.description.arg.source.noteText,
    },
    unset: {
      type: "boolean",
      description: text.description.arg.source.noteUnset,
    },
  },
  async run({ args }) {
    const cmd = command()
    try {
      const { keyName } = args
      cmd.start(text.label.command.sourceNote, text.description.command.cli.source.note)

      if (args._.length > 2)
        throw new Error(text.error.command.unexpectedArguments(args._.slice(2).join(" ")))
      if (args.unset && args.note !== undefined)
        throw new Error(text.error.command.conflictingNote)

      const config = await loadConfig()
      const entry = config.source[keyName]
      if (!entry)
        throw new Error(text.error.source.unknown(keyName))

      if (args.unset) {
        delete config.source[keyName].note
        await saveConfig(config)
        cmd.say(text.success.sourceNoteUnset(ui.primary(keyName)))
        cmd.finish()
        return
      }

      if (args.note === undefined) {
        cmd.say(entry.note ?? text.state.noSourceNote(keyName))
        cmd.finish()
        return
      }

      if (args.note.trim() === "")
        throw new Error(text.error.source.noteEmpty)

      config.source[keyName] = { ...entry, note: args.note }
      await saveConfig(config)
      cmd.say(text.success.sourceNoteSet(ui.primary(keyName), args.note))
      cmd.finish()
    }
    catch (error) {
      cmd.fail(error)
    }
  },
})
