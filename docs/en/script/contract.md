---
title: Script Contract
order: 2
---

# {{ $frontmatter.title }}

The script contract is formed by the directory layout, the fields of the two JSON files, and the way arguments are declared.

## Directory layout

A script directory contains at least three files; anything else is treated as a resource:

```
lint/eslint/
  script.json     # required: script metadata
  index.ts        # required: entry code, default entry
  argv.ts         # required: argument definition, default argument file
  templates/      # optional: resources, cloned along with the source
```

ohstart clones the whole source, so resources placed inside the script directory are read with relative paths.

## script.json

This file describes the script itself; its fields decide how the script is identified and invoked:

```json
{
  "name": "lint/eslint",
  "type": "add",
  "description": "Install an eslint configuration",
  "entry": "index.ts",
  "argv": "argv.ts"
}
```

| Field         | Required | Description                                                                      |
| ------------- | -------- | -------------------------------------------------------------------------------- |
| `name`        | Yes      | Script name; must match its key in `ohstart.json`, otherwise an error is raised. |
| `type`        | Yes      | `init` or `add`, deciding which command runs it.                                 |
| `description` | Yes      | One line shown by `ohstart list`.                                                |
| `entry`       | No       | Entry file, `index.ts` by default. The file itself must exist.                   |
| `argv`        | No       | Argument definition file, `argv.ts` by default. The file itself must exist.      |

`name` and **path** are separate: names may be grouped with `/`, paths may differ from names, and `scripts` in `ohstart.json` points names at paths.

## index.ts

The entry file is executed after bundling and accepts only one export form:

```ts
export default async function main() {
  // ...
}
```

Exporting anything else fails with `script entry must default-export a function`.

Scripts run in the **user's current directory**, not in the source directory. Relative paths inside the source must be resolved through `import.meta.url` or an equivalent, never through `process.cwd()`.

## argv.ts

The argument definition describes what the script accepts and must default-export the result of `defineArgv(...)`:

```ts
import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({
  args: [
    { name: "name", description: "Name to greet" },
    { name: "target", required: true, description: "Where to write" },
  ],
  flags: {
    path: { type: "string", description: "Directory to create hello.md in" },
    force: { type: "boolean", description: "Overwrite existing files" },
  },
})
```

Exporting a bare schema is rejected with `a bare schema, which is not supported`.

### Positional arguments (args)

Positional arguments are assigned in order and used for required input.

| Field         | Description                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | Argument name, required                                                                                                        |
| `description` | Prompt text, required. Shown when the argument is missing.                                                                     |
| `required`    | Whether the argument is mandatory. Missing values are prompted for on a terminal and rejected in non-interactive environments. |

Positional arguments map to the positional values on the command line, in order.

### Flags

Flags are passed with the `--` prefix and come in switch and value forms.

| Field         | Description                     |
| ------------- | ------------------------------- |
| `type`        | `string` or `boolean`, required |
| `description` | Explanation text, required      |

A flag is passed as `--name` or `--name value`. A `boolean` flag written as `--force` evaluates to `true`.

### Reading arguments

Scripts read the parsed result through `getArgv()` and never handle environment variables themselves:

```ts
import argv from "./argv.js"

const { getArgv } = argv

export default async function main() {
  const { args, flags } = getArgv()
  const name = args[0] ?? "world"
  const dir = flags.path ?? process.cwd()
  const force = flags.force === true
}
```

`getArgv()` returns:

```ts
interface ScriptArgv {
  args: string[]
  flags: { [name: string]: string | boolean }
}
```

Values come from the `OHSTART_ARGV` environment variable that ohstart passes to the script, in JSON form.

Flag names are passed through exactly as written in `argv.ts`; ohstart does not rename them.

## ohstart.json

The manifest at the source root decides which scripts ohstart recognizes:

```json
{
  "name": "my-templates",
  "author": "your-name",
  "description": "Team templates",
  "scripts": {
    "sayhi": "sayhi",
    "lint/eslint": "lint/eslint"
  }
}
```

Rules for `scripts`:

- Values must be strings pointing at a directory inside the source.
- Paths must not escape the source directory.
- A single path cannot be used by two script names.

See [Contract fields](../reference/contracts.md) for field-level details.

## Next steps

- [SDK Reference](./sdk.md): `log` / `prompt` / `agent` inside scripts.
- [Local Debugging](./debug.md): contract checks and execution.
- [Contract fields](../reference/contracts.md): field-level details.
