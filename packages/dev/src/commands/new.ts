import type { ScriptType } from "@shared/types"
import { isAbsolute, relative, resolve, sep } from "node:path"
import { fail, log } from "@shared/logger"
import { prompt } from "@shared/prompts"
import { readOhstartJson } from "@shared/read"
import { defineCommand } from "citty"
import { assertScriptName, isVacantDir, pathExists, removeDir, writeScriptSkeleton } from "@/scaffold"
import { findSourceRoot, writeSourceJson } from "@/source"

export default defineCommand({
  meta: {
    name: "new",
    description: "在已有的源里新增一个脚本骨架",
  },
  args: {
    dir: {
      type: "positional",
      required: false,
      description: "脚本目录, 默认当前目录",
    },
    name: {
      type: "positional",
      required: false,
      description: "脚本名, 默认取目录相对源根的路径",
    },
    type: {
      type: "enum",
      options: ["init", "add"],
      required: false,
      description: "脚本类型, 省略则交互选择",
    },
    description: {
      type: "string",
      description: "脚本描述",
    },
  },
  async run({ args }) {
    try {
      const root = await findSourceRoot(args.dir ?? ".")
      const target = resolve(args.dir ?? ".")
      const path = toPosix(relative(root, target))
      if (!path || path.startsWith("..") || isAbsolute(path))
        throw new Error(`${target} is not inside the source ${root}`)

      const name = args.name?.trim() || path
      assertScriptName(name)
      const type = args.type ?? await selectType()
      const description = args.description?.trim() ?? ""

      const meta = await readOhstartJson(root)
      if (meta.scripts[name])
        throw new Error(`script ${name} already exists`)
      if (Object.values(meta.scripts).includes(path))
        throw new Error(`path ${path} is already used by another script`)
      if (!await isVacantDir(target))
        throw new Error(`directory ${path} already exists and is not empty`)

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

      log.info(`created script ${name} at ${path}`)
      log.info(`next: ohsd check ${name}`)
    }
    catch (error) {
      fail(error)
    }
  },
})

function toPosix(path: string): string {
  return path.split(sep).join("/")
}

async function selectType(): Promise<ScriptType> {
  const value = await prompt.select("script type", [{ label: "init" }, { label: "add" }])
  return value === "init" ? "init" : "add"
}
