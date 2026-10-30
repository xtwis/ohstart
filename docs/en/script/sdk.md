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
| `log`        | object   | Write lines to stdout, stderr and debug output                                 |
| `prompt`     | object   | Interact with the user: text, confirm, select, multiselect, password           |
| `agent`      | object   | Drive the package manager: install dependencies, run scripts, execute commands |
| `defineArgv` | function | Declare script arguments                                                       |

Types are exported as well: `Agent`, `AgentIdentity`, `AgentName`, `AgentOptions`, `AgentResult`.

## Dependencies in the source repository

The SDK is injected by ohstart at bundling time, so nothing has to be installed before running a script. Writing `import { log } from "@xtwis/ohstart-dev"` is enough; the package name is rewritten to the built-in implementation.

The trade-off is that scripts can only use SDK exports and Node built-ins, and cannot pull in third-party dependencies.

## Logging

`log` writes text to the terminal:

```ts
log.out("hello")
log.error("something broke")
log.debug("only shown with OHSTART_DEBUG")
```

| Member  | Stream | Notes                                |
| ------- | ------ | ------------------------------------ |
| `out`   | stdout | Normal output                        |
| `error` | stderr | Failures and warnings                |
| `debug` | stderr | Silent unless `OHSTART_DEBUG` is set |

## Prompts

`prompt` handles user interaction with the [clack](https://github.com/bombshell-dev/clack) prompt components:

```ts
const name = await prompt.text({ message: "Your name" })
const ok = await prompt.confirm({ message: "Continue?" })
const one = await prompt.select({ message: "Pick one", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] })
const many = await prompt.multiselect({ message: "Pick some", options: [{ value: "a", label: "A" }] })
const secret = await prompt.password({ message: "Token" })
```

| Member        | Arguments                      | Returns    |
| ------------- | ------------------------------ | ---------- |
| `text`        | `({ message, validate? })`     | `string`   |
| `confirm`     | `({ message, initialValue? })` | `boolean`  |
| `select`      | `({ message, options })`       | `string`   |
| `multiselect` | `({ message, options })`       | `string[]` |
| `password`    | `({ message })`                | `string`   |

An option is `{ value, label?, hint? }`; `label` is used when it is omitted.

`validate` in `text` returns `undefined` to accept a value, or a string to reject it; that string is shown to the user.

```ts
const name = await prompt.text({
  message: "Your name",
  validate: value => value?.trim() ? undefined : "name is required",
})
```

`group` runs several prompts in sequence and returns their answers, and `cancel` prints the cancellation message.

Prompts need key presses and therefore a terminal with raw mode; non-interactive environments fail immediately with `interactive prompt requires a tty`. A cancelled prompt prints the cancellation message and exits with status 0.

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
