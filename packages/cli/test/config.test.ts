import { mkdtemp, rm } from "node:fs/promises"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { loadConfig, resolveConfigPath, saveConfig } from "@/config.js"

const dirs: string[] = []

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "ohstart-test-"))
  dirs.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe("resolveConfigPath - config location", () => {
  it("prefers xdg config home when it is set", () => {
    expect(resolveConfigPath({ XDG_CONFIG_HOME: "/xdg" }, "linux")).toBe(join("/xdg", "ohstart", "config.json"))
  })

  it("falls back to appdata on windows", () => {
    expect(resolveConfigPath({ APPDATA: "/appdata" }, "win32")).toBe(join("/appdata", "ohstart", "config.json"))
  })

  it("falls back to home config on other platforms", () => {
    expect(resolveConfigPath({}, "linux")).toBe(join(homedir(), ".config", "ohstart", "config.json"))
  })
})

describe("loadConfig - reading config", () => {
  it("returns an empty config when the file is missing", async () => {
    const path = join(await makeTempDir(), "config.json")
    await expect(loadConfig(path)).resolves.toEqual({ source: {} })
  })
})

describe("saveConfig - writing config", () => {
  it("creates the directory and round trips the content", async () => {
    const path = join(await makeTempDir(), "nested", "config.json")
    const config = {
      source: { demo: { name: "demo", url: "u", note: "n" } },
      default: "demo",
    }
    await saveConfig(config, path)
    await expect(loadConfig(path)).resolves.toEqual(config)
  })
})
