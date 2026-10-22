import { access, mkdir, rm, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

export async function writeExclusive(file: string, content: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content, { encoding: "utf8", flag: "wx" })
}

export async function removeDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}
