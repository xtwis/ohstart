---
title: SDK Reference
order: 3
---

# {{ $frontmatter.title }}

Scripts can only rely on what the SDK exports, and this page walks through each export.

## Exports

The public surface of the SDK is small; every export is listed below:

```ts
import { agent, defineArgv, log, prompt } from "@xtwis/ohstart-dev"
```

| Export       | Type     | Purpose                                                                        |
| ------------ | -------- | ------------------------------------------------------------------------------ |
| `log`        | object   | Print info, warnings, errors and debug logs                                    |
| `prompt`     | object   | Interact with the user: input, confirm, select, multiselect                    |
| `agent`      | object   | Drive the package manager: install dependencies, run scripts, execute commands |
| `defineArgv` | function | Declare script arguments                                                       |

Types are exported as well: `Agent`, `AgentIdentity`, `AgentName`, `AgentOptions`, `AgentResult`.

## Dependencies in the source repository

The SDK is injected by ohstart at bundling time, so nothing has to be installed before running a script. Writing `import { log } from "@xtwis/ohstart-dev"` is enough; the package name is rewritten to the built-in implementation.

The trade-off is that scripts can only use SDK exports and Node built-ins, and cannot pull in third-party dependencies.

## Logging

`log` prints info, warnings, errors and debug output to the terminal:

```ts
log.info("hello")
log.warn("careful")
log.error("something broke")
log.debug("only shown with OHSTART_DEBUG")
```

`info` writes to stdout, `warn` and `error` write to stderr. `debug` only writes when `OHSTART_DEBUG` is set.

## Prompts

`prompt` handles user interaction and provides input, confirmation, single and multiple selection:

```ts
const name = await prompt.input("Your name")
const ok = await prompt.confirm("Continue?")
const one = await prompt.select("Pick one", [{ label: "A" }, { label: "B" }])
const many = await prompt.multiselect("Pick some", [{ label: "A" }, { label: "B" }])
```

| Method        | Arguments                            | Returns    |
| ------------- | ------------------------------------ | ---------- |
| `input`       | `(message, { default?, validate? })` | `string`   |
| `confirm`     | `(message, { default? })`            | `boolean`  |
| `select`      | `(message, options)`                 | `string`   |
| `multiselect` | `(message, options)`                 | `string[]` |

An option is `{ label, value? }`; `label` is used when `value` is omitted.

`validate` in `input` returns `true` to accept a value, or a string to reject it; that string is shown to the user.

```ts
const name = await prompt.input("Your name", {
  validate: value => value.trim().length > 0 || "name is required",
})
```

`select` and `multiselect` need key presses and therefore a terminal with raw mode; non-interactive environments fail immediately.

## Package manager

`agent` drives the package manager of the current project, so scripts never have to tell npm, pnpm and yarn apart. The resolved values are available as `agent.name` and `agent.version`.

### Methods

```ts
await agent.install()
await agent.add("eslint", { dev: true })
await agent.remove(["typescript"])
await agent.run("build", ["--watch"])
await agent.execute("git", ["status"])
await agent.dlx("create-vite", ["my-app"])
await agent.resolve("pnpm", "dlx", "create-vite")
```

| Method                   | npm                          | pnpm / yarn                                                |
| ------------------------ | ---------------------------- | ---------------------------------------------------------- |
| `install()`              | `npm install`                | `pnpm install` / `yarn install`                            |
| `add(packages)`          | `npm install <packages>`     | `pnpm add <packages>` / `yarn add <packages>`              |
| `remove(packages)`       | `npm uninstall <packages>`   | `pnpm remove <packages>` / `yarn remove <packages>`        |
| `run(script, args)`      | `npm run <script> -- <args>` | `pnpm run <script> -- <args>` / `yarn run <script> <args>` |
| `execute(command, args)` | `npm exec -- <command>`      | `pnpm exec <command>` / `yarn <command>`                   |
| `dlx(package, args)`     | `npx <package>`              | `pnpm dlx <package>` / `yarn dlx <package>`                |

`add` and `remove` accept both a string and an array of strings.

`resolve(manager, ...args)` bypasses the current choice and runs a raw command with the given package manager; the example above is equivalent to running `pnpm dlx create-vite`.

### Options

```ts
await agent.add(["vitest"], { dev: true, ignoreScripts: true })
```

| Option          | Purpose                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `dev`           | Install as a development dependency, equivalent to `-D`                                            |
| `ignoreScripts` | Append `--ignore-scripts`                                                                          |
| `throwOnError`  | Defaults to `true`, failing the call on a non-zero exit. Set to `false` to only return the result. |

### Return value

```ts
const result = await agent.run("build")
// { exitCode: number, stdout: string, stderr: string }
```

Command output goes straight to the terminal, so `stdout` and `stderr` are usually empty; `exitCode` is what matters.

### Failures

A failed command throws, and the error carries `exitCode`, `stdout`, `stderr` and `command`:

```ts
try {
  await agent.install()
}
catch (error) {
  if (error instanceof Error && "exitCode" in error)
    log.error(`install failed with ${error.exitCode}`)
}
```

`AgentError` is not exported by the SDK, so check the properties rather than importing the class.

## Next steps

- [Local Debugging](./debug.md): contract checks and execution.
- [Package manager selection](../guide/scripts.md): how users choose a package manager.
