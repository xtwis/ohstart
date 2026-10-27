---
title: Getting Started
order: 1
---

# {{ $frontmatter.title }}

This page starts from an empty directory, creates a source, adds a script and runs it locally. All commands come from `@xtwis/ohstart-dev`, whose executable is `ohsd`.

## Installation

`ohsd` is installed as a development dependency of the source:

```bash
pnpm add -D @xtwis/ohstart-dev
```

## Creating a source

Pick an empty directory and let `ohsd init` write the source skeleton:

```bash
mkdir my-templates && cd my-templates
ohsd init
```

The skeleton written by `ohsd init`:

```
my-templates/
  ohstart.json      # source manifest
  package.json      # project configuration
  tsconfig.json     # TypeScript configuration
  .gitignore        # ohstart ignore entries are appended
  sayhi/            # sample script, omitted with --bare
    script.json
    argv.ts
    index.ts
```

Constraints and defaults:

- The directory must be essentially empty; only `.git`, `.gitignore`, `.DS_Store`, `README*` and `LICENSE*` may already exist.
- The source name defaults to the directory name, the author to `git config user.name`; both can be overridden with `--name`, `--author` and `--description`.
- `--bare` skips the sample script.
- A missing `.git` produces a warning only and does not block the operation.

The resulting `ohstart.json`:

```json
{
  "name": "my-templates",
  "author": "your-name",
  "description": "",
  "scripts": {
    "sayhi": "sayhi"
  }
}
```

`scripts` maps script names to directory paths.

## Adding a script

A script is a directory inside the source; `ohsd new` creates and registers it:

```bash
ohsd new lint/eslint --type add --description "Install an eslint configuration"
```

It writes:

```
lint/eslint/
  script.json
  argv.ts
  index.ts
```

and adds `"lint/eslint": "lint/eslint"` to `ohstart.json`.

Constraints:

- The script directory must be inside the source and must not be the source root.
- Paths cannot start with `.` and cannot contain spaces.
- A target directory that already exists and is not empty is rejected.
- The script name defaults to the path relative to the source root; a second positional argument overrides it.
- Without `--type`, ohstart asks whether the script is `init` or `add`.

## Writing a script

A script consists of an entry file and an argument definition, which together form the execution contract.

The entry is `index.ts` and must default-export a function:

```ts
import { log } from "@xtwis/ohstart-dev"

export default async function main() {
  log.info("hello from ohstart script")
}
```

Arguments are declared in `argv.ts`:

```ts
import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({
  args: [{ name: "name", description: "Name to greet" }],
  flags: { path: { type: "string", description: "Directory to write hello.md in" } },
})
```

Reading the arguments inside the script:

```ts
import argv from "./argv.js"

const { getArgv } = argv

export default async function main() {
  const { args, flags } = getArgv()
  log.info(`hello ${args[0] ?? "world"}`)
}
```

## Running locally

`ohsd run` executes the script in a separate working directory, leaving the source untouched:

```bash
ohsd run add sayhi
```

The working directory is `.ohstart` at the source root. It is cleared before each run; `--keep` preserves it.

Confirm the contract first:

```bash
ohsd check
```

## Next steps

- [Script Contract](./contract.md): the role of each file in a script directory, and how arguments are defined.
- [SDK Reference](./sdk.md): `log` / `prompt` / `agent` inside scripts.
- [Local Debugging](./debug.md): details of `check` and `run`.
