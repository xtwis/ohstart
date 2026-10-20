import { join } from "node:path"
import process from "node:process"
import { defineCommand } from "citty"
import { log } from "@/logger"
import { assertScriptName, assertScriptPath, isVacantDir, pathExists, removeDir, writeScriptSkeleton } from "@/scaffold"
import { readSourceJson, writeSourceJson } from "@/source"

export default defineCommand({
  meta: {
    name: "new",
    description: "在已有的源里新增一个脚本骨架",
  },
  args: {
    script: {
      type: "positional",
      required: true,
      description: "脚本名, 支持 a/b 分级",
    },
    type: {
      type: "enum",
      options: ["init", "add"],
      required: true,
      description: "脚本类型",
    },
    description: {
      type: "string",
      required: true,
      description: "脚本描述",
    },
    path: {
      type: "string",
      description: "脚本目录, 默认等于脚本名",
    },
  },
  async run({ args }) {
    try {
      const root = process.cwd()
      const name = args.script
      const path = args.path?.trim() || name
      const description = args.description.trim()
      if (!description)
        throw new Error("script description is required")

      const meta = await readSourceJson(root)
      assertScriptName(name)
      assertScriptPath(path)
      if (meta.scripts[name])
        throw new Error(`script ${name} already exists`)
      if (Object.values(meta.scripts).includes(path))
        throw new Error(`path ${path} is already used by another script`)

      const dir = join(root, path)
      if (!await isVacantDir(dir))
        throw new Error(`directory ${path} already exists and is not empty`)

      const created = !await pathExists(dir)
      try {
        await writeScriptSkeleton(dir, { name, type: args.type, description })
      }
      catch (error) {
        if (created)
          await removeDir(dir)
        throw error
      }

      meta.scripts[name] = path
      await writeSourceJson(root, meta)

      log.info(`created script ${name} at ${path}`)
      log.info(`next: ohsd check ${name}`)
    }
    catch (error) {
      log.fail(error)
    }
  },
})
