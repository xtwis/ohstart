import type { ScriptType } from "@shared/types"
import { resolve } from "node:path"
import { fail, log } from "@shared/logger"
import { prompt } from "@shared/prompts"
import { readOhstartJson } from "@shared/read"
import { text } from "@shared/text"
import { defineCommand } from "citty"
import { assertScriptName, isVacantDir, pathExists, removeDir, resolveScriptPath, writeScriptSkeleton } from "@/scaffold"
import { findSourceRoot, writeSourceJson } from "@/source"

export default defineCommand({
  meta: {
    name: "new",
    description: text.description.command.dev.new,
  },
  args: {
    dir: {
      type: "positional",
      required: false,
      description: text.description.arg.script.dir,
    },
    name: {
      type: "positional",
      required: false,
      description: text.description.arg.script.nameOption,
    },
    type: {
      type: "enum",
      options: ["init", "add"],
      required: false,
      description: text.description.arg.script.typeOption,
    },
    description: {
      type: "string",
      description: text.description.arg.script.description,
    },
  },
  async run({ args }) {
    try {
      const root = await findSourceRoot(args.dir ?? ".")
      const target = resolve(args.dir ?? ".")

      const path = resolveScriptPath(root, target)
      const name = args.name?.trim() || path
      assertScriptName(name)
      const type = args.type ?? await selectType()
      const description = args.description?.trim() ?? ""

      const meta = await readOhstartJson(root)
      if (meta.scripts[name])
        throw new Error(text.error.project.skeleton.exists(name))
      if (Object.values(meta.scripts).includes(path))
        throw new Error(text.error.project.skeleton.pathUsed(path))
      if (!await isVacantDir(target))
        throw new Error(text.error.project.skeleton.dirNotEmpty(path))

      const created = !await pathExists(target)
      try {
        await writeScriptSkeleton(target, { name, type, description })
      }
      catch (error) {
        if (created)
          await removeDir(target)
        throw error
      }

      meta.scripts[name] = path
      await writeSourceJson(root, meta)

      log.out(text.success.createdScript(name, path))
      log.out(text.next.checkSteps(name))
    }
    catch (error) {
      fail(error)
    }
  },
})

async function selectType(): Promise<ScriptType> {
  const answer = await prompt.select({
    message: text.question.selectScriptType,
    options: [
      { value: "init", label: text.label.option.init },
      { value: "add", label: text.label.option.add },
    ],
  })
  return answer === "init" ? "init" : "add"
}
