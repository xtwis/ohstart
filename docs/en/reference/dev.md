---
title: ohsd CLI reference
order: 2
---

# {{ $frontmatter.title }}

`ohsd` is the source-author command, shipped by `@xtwis/ohstart-dev`. The binary is `ohstart-dev`, with `ohsd` as an alias. This page lists every command with its arguments and output.

## Command overview

| Command                             | Alias | Purpose                                  |
| ----------------------------------- | ----- | ---------------------------------------- |
| `ohsd init [dir]`                   | -     | Create a source skeleton                 |
| `ohsd new [dir] [name]`             | -     | Add a script skeleton to a source        |
| `ohsd check [script]`               | -     | Validate the source and script contracts |
| `ohsd run <type> <script> [arg...]` | -     | Try a script in a local work directory   |
| `ohsd version`                      | `ver` | Print the version                        |
| `ohsd help`                         | -     | Print usage                              |

Without a subcommand, `help` runs.

`new`, `run` and `check` depend on a source root: the command walks up from the current directory to the git repository root and requires an `ohstart.json` there. `init` is not affected.

## init

```
ohsd init [dir] [--name <name>] [--author <author>] [--description <text>] [--bare]
```

Creates a source skeleton; `dir` defaults to the current directory.

| Argument or flag | Required | Description                                     |
| ---------------- | -------- | ----------------------------------------------- |
| `dir`            | No       | Target directory, defaults to the current one   |
| `--name`         | No       | Source name, defaults to the directory name     |
| `--author`       | No       | Author, defaults to `git config user.name`      |
| `--description`  | No       | Source description, defaults to an empty string |
| `--bare`         | No       | Do not create the sample script                 |

The target directory must be empty, and an existing entry is rejected as `is not empty`.

Files created:

| File            | Content                                                                             |
| --------------- | ----------------------------------------------------------------------------------- |
| `ohstart.json`  | Source manifest with the sample script registered                                   |
| `package.json`  | `type: module`, depends on `@xtwis/ohstart-dev` and `typescript`                    |
| `tsconfig.json` | Type checking for `pnpm check`                                                      |
| `.gitignore`    | Appends the `# ohstart` header with `.ohstart`, `.ohstart-run.mjs`, `node_modules/` |
| `sayhi/`        | Sample `add` script writing `hello.md`, skipped with `--bare`                       |

On success:

```
ohsd init
┌  create a new source skeleton (ohstart.json + project config + sample script)
│
◇  created source my-templates with sample script in /path/to/my-templates
│
◇  not a git repository yet: run `git init` before publishing this source
│
◇  next: pnpm install | pnpm check | ohsd new <dir> --type add | ohsd check
│
●
```

Without a git repository, ohstart hints at running `git init` first.

## new

```
ohsd new [dir] [name] [--type <init|add>] [--description <text>]
```

Adds a script skeleton to an existing source and registers it in `ohstart.json`.

| Argument or flag | Required | Description                                                   |
| ---------------- | -------- | ------------------------------------------------------------- |
| `dir`            | No       | Script directory, defaults to the current one                 |
| `name`           | No       | Script name, defaults to the path relative to the source root |
| `--type`         | No       | `init` or `add`; selected interactively when omitted          |
| `--description`  | No       | Script description, defaults to an empty string               |

Omitting `--type` requires an interactive terminal; provide it explicitly in non-interactive environments.

The path of the directory relative to the source root is the script path. Constraints:

- The path must stay inside the source root and must not be the root itself.
- No segment of the path may start with a dot.
- The name must not contain whitespace, backslashes or colons, must not start with `/`, and must not contain `.` or `..` segments.
- Neither the name nor the path may collide with an existing entry.
- The directory must be empty.

Three files are written, `script.json`, `argv.ts` and `index.ts`, and the command prints:

```
ohsd new
┌  add a script skeleton to an existing source
│
◇  created script lint/eslint at lint/eslint
│
◇  next: ohsd check lint/eslint
│
●
```

## check

```
ohsd check [script]
```

Static validation only; no script code is executed.

| Argument | Required | Description                                           |
| -------- | -------- | ----------------------------------------------------- |
| `script` | No       | Validate only this script, otherwise the whole source |

Checks:

| Check                | Level   | Condition                                                               |
| -------------------- | ------- | ----------------------------------------------------------------------- |
| Source root          | error   | Not inside a git repository, or the root lacks `ohstart.json`           |
| Duplicate paths      | error   | Two script names point to the same path                                 |
| Script directory     | error   | The directory is missing, or the path is not a directory                |
| `script.json`        | error   | Invalid JSON, missing fields or wrong types                             |
| Name match           | error   | `name` in `script.json` differs from the registered key                 |
| Entry file           | error   | The file named by `entry` is missing                                    |
| Argv file            | error   | The file named by `argv` is missing                                     |
| Unregistered scripts | warning | A directory holds `script.json` but is not registered in `ohstart.json` |

Validating a single script skips the duplicate path and unregistered script checks.

With no findings:

```
ohsd check
┌  validate the source contract
│
◇  source my-templates at /path/to/my-templates (2 scripts registered)
│
◇  check passed
│
●
```

With findings, each is printed and a summary closes the output:

```
ohsd check
┌  validate the source contract
│
◇  source my-templates at /path/to/my-templates (2 scripts registered)
│
◇  error  script directory does not exist: lint/eslint -> lint/eslint
│
◇  1 errors, 0 warnings
│
●
```

Any error exits with `1`; warnings alone exit with `0`.

## run

```
ohsd run <type> <script> [arg...]
```

Executes a script in a work directory, to verify its actual behavior.

| Argument or flag              | Position               | Description                                             |
| ----------------------------- | ---------------------- | ------------------------------------------------------- |
| `type`                        | Required               | `init` or `add`, must match the registered type         |
| `script`                      | Required               | Script name, must match a key in `ohstart.json`         |
| `arg...`                      | Optional               | Passed to the script as-is                              |
| `--keep`                      | Before the script name | Keep the previous work directory content                |
| `--no-git`                    | Before the script name | Skip `git init` and write a minimal repository skeleton |
| `--npm` / `--pnpm` / `--yarn` | Before the script name | Select the package manager for the work directory       |
| `--agent=<npm\|pnpm\|yarn>`   | Before the script name | Same, in assignment form                                |
| `--no-detect`                 | Before the script name | Skip package manager detection                          |

Every flag above must precede the script name. A token of the same name after it belongs to the script; `ohsd` makes no distinction.

The work directory is always `.ohstart` under the source root:

- It is cleared before each run, or kept with `--keep`.
- On first use, `.ohstart` and `.ohstart-run.mjs` are appended to the source `.gitignore`.
- A git repository is initialized inside, so a script looking for a repository root stops here instead of hitting the source repository. With `--no-git`, a minimal skeleton made of `HEAD` and `config` is written instead.
- A package manager project is initialized inside. For pnpm the command runs `pnpm init --bare --no-init-package-manager` and writes a `pnpm-workspace.yaml` with an empty `packages` list, so pnpm does not treat the source repository as a workspace root. A failed init falls back to a minimal `package.json`.

Package manager detection starts at the work directory, so it walks up into the source repository own `package.json` and lock files. When detection finds nothing or an unsupported package manager, pnpm is used and a warning is printed. See [Package manager](../guide/scripts.md) for the detection rules.

Debug output:

```bash
OHSTART_DEBUG=1 ohsd run add sayhi
```

With `OHSTART_DEBUG` set, the work directory path and appended `.gitignore` content are printed.

When the script exits non-zero, `ohsd run` exits with the same code. The script's own output is printed inside the frame, before the closing marker:

```
ohsd run
┌  try a script in the local source; the working directory is .ohstart under the source root
hello from ohstart script
│
●
```

## help

```bash
ohsd help
```

Prints usage for the command: positional arguments, options and subcommands, listed with descriptions.

Every command accepts `--help` to show the same usage:

```bash
ohsd run --help
```

## version

```bash
ohsd version
```

Prints the current version.

## Next steps

- [ohstart CLI reference](./cli.md): user-facing commands.
- [Contract fields](./contracts.md): fields of `ohstart.json` and `script.json`.
- [Local debugging](../script/debug.md): checks and work directory usage.
