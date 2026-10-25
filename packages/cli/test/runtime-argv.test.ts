import type { ArgvSchema } from "@shared/argv/schema"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { describe, expect, it } from "vitest"

const schema: ArgvSchema = {
  args: [{ name: "project-name", required: true, description: "Project name" }],
  flags: {
    typescript: { type: "boolean", description: "Use TypeScript" },
    port: { type: "string", description: "Dev server port" },
  },
}

describe("parseScriptArgv - token parsing", () => {
  it("keeps positionals apart from boolean flags", () => {
    expect(parseScriptArgv(["my-app", "--typescript"], schema)).toEqual({
      args: ["my-app"],
      flags: { typescript: true },
    })
  })

  it("consumes the next token as a string flag value", () => {
    expect(parseScriptArgv(["my-app", "--port", "3000"], schema).flags.port).toBe("3000")
  })

  it("leaves the value out of args", () => {
    expect(parseScriptArgv(["my-app", "--port", "3000"], schema).args).toEqual(["my-app"])
  })

  it("lets the last repeated flag win", () => {
    expect(parseScriptArgv(["my-app", "--port", "3000", "--port", "4000"], schema).flags.port).toBe("4000")
  })

  it("treats an unknown flag as boolean", () => {
    expect(parseScriptArgv(["my-app", "--dry-run"], schema).flags["dry-run"]).toBe(true)
  })

  it("keeps positionals that follow an unknown flag", () => {
    expect(parseScriptArgv(["my-app", "--dry-run", "extra"], schema).args).toEqual(["my-app", "extra"])
  })

  it("moves tokens after the separator into args", () => {
    expect(parseScriptArgv(["my-app", "--", "--typescript", "x"], schema).args).toEqual([
      "my-app",
      "--typescript",
      "x",
    ])
  })

  it("keeps flags empty after the separator", () => {
    expect(parseScriptArgv(["my-app", "--", "--typescript"], schema).flags).toEqual({})
  })
})

describe("fillRequiredArgs - required positional completion", () => {
  it("rejects a missing required arg on non-tty stdin", async () => {
    await expect(fillRequiredArgs(schema, { args: [], flags: {} })).rejects.toThrow("missing required arg: project-name")
  })

  it("keeps a provided arg without prompting", async () => {
    const argv = { args: ["my-app"], flags: {} }
    await fillRequiredArgs(schema, argv)
    expect(argv.args).toEqual(["my-app"])
  })

  it("ignores a schema without required args", async () => {
    const argv = { args: [], flags: {} }
    await expect(fillRequiredArgs({}, argv)).resolves.toBeUndefined()
  })
})
