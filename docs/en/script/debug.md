---
title: Local Debugging
order: 4
---

# {{ $frontmatter.title }}

Two commands cover static checks and actual execution; use them in turn as needed.

## Contract check

`ohsd check` inspects the contracts of the source and its scripts without executing any code:

```bash
ohsd check
```

The checks are:

| Check               | Level   | Description                                                     |
| ------------------- | ------- | --------------------------------------------------------------- |
| Source root         | error   | Must be inside a git repository whose root has `ohstart.json`   |
| Duplicate paths     | error   | Two script names pointing at the same directory                 |
| Script directory    | error   | The directory is missing or is not a directory                  |
| `script.json`       | error   | JSON syntax, required fields, whether `type` is init / add      |
| Name match          | error   | `name` in `script.json` differs from the registered key         |
| Entry file          | error   | `index.ts` or the file given by `entry` is missing              |
| Argument file       | error   | `argv.ts` or the file given by `argv` is missing                |
| Unregistered script | warning | A directory has `script.json` but is absent from `ohstart.json` |

Output when nothing is wrong:

```
source my-templates at /path/to/my-templates (2 scripts registered)
check passed
```

Problems are listed one per line, followed by a summary:

```
source my-templates at /path/to/my-templates (2 scripts registered)
error  script directory does not exist: lint/eslint -> lint/eslint
1 errors, 0 warnings
```

Check a single script:

```bash
ohsd check lint/eslint
```

The exit code is 1 when errors are present and 0 when only warnings remain.

## Running scripts

`ohsd run` follows the same flow users get, but keeps the working directory apart from the source repository:

```bash
ohsd run add sayhi
```

`ohsd run` performs the following:

1. Creates `.ohstart` at the **source root** as the working directory.
2. Initializes a minimal project (`package.json`) and a git repository inside it.
3. Bundles the script and executes it in that working directory.

Scripts usually install dependencies, create files and expect a git repository. Running them directly in the source would pollute it, so they run inside `.ohstart` instead.

Related flags:

| Flag                          | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `--keep`                      | Keep the previous working directory instead of clearing it   |
| `--no-git`                    | Skip git and write a minimal repository skeleton instead     |
| `--npm` / `--pnpm` / `--yarn` | Choose the package manager used in the working directory     |
| `--agent=<name>`              | Same as above, in assignment form                            |
| `--no-detect`                 | Skip detection; combined with `--agent`, use the given value |

The project inside the working directory is initialized per package manager. With pnpm, a `pnpm-workspace.yaml` containing an empty `packages` list is also written, so that pnpm does not treat the source repository as the workspace root; if initialization fails, a minimal `package.json` is written. When nothing is specified and detection fails, pnpm is used.

`--no-git` is meant for environments without git: `git init` is skipped and a minimal repository skeleton made of `HEAD` and `config` is written. A script looking upwards for a git root stops at `.ohstart` instead of hitting the source repository.

The working directory is `.ohstart`, which is written to `.gitignore` and never committed by accident.

### Passing arguments

The syntax matches the user side: arguments follow the script name.

```bash
ohsd run add sayhi my-name --path ./out
```

## Debugging

Logs and exit codes are the main tools.

- Add `log.debug(...)` to the script and run `OHSTART_DEBUG=1 ohsd run add sayhi` to see intermediate state.
- Inspect script metadata and usage with `ohstart view <script>`.
- A failing script propagates its exit code, and `ohsd run` exits non-zero as well.

## Next steps

- [Script Contract](./contract.md): contract details.
- [SDK Reference](./sdk.md): capabilities available inside scripts.
