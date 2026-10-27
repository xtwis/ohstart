---
title: Running Scripts
order: 4
---

# {{ $frontmatter.title }}

This page covers how scripts run and how arguments are passed.

## Two commands

```bash
ohstart init <script> [args...]    # initialization scripts
ohstart add <script> [args...]     # installation scripts
```

The command must match the script type. Running an `init` script through `ohstart add` fails and reports the command to use instead.

Script addresses come in two forms:

```bash
ohstart init vite/react              # default source
ohstart init @my-team/vite/react     # specific source
```

## Passing arguments

Everything after the script name is handed to the script; ohstart does not parse it:

```bash
ohstart init vite/react my-app --template react-ts
```

- `my-app` is a **positional argument** of the script.
- `--template react-ts` is a **flag** of the script.

ohstart keeps the following flags for itself: `--trust` (allow the trust confirmation once), `--npm` / `--pnpm` / `--yarn`, `--agent=<name>` and `--no-detect` (package manager selection). They must appear **before** the script name:

```bash
ohstart init --pnpm vite/react
```

Arguments after the script name belong to the script, even when they share a name with the flags above.

## Required arguments

A script may declare required positional arguments in `argv.ts`. When one is missing, ohstart prompts for it, using the argument `description` as the prompt text:

```
Name to greet
```

Non-interactive environments get no prompt and fail with `missing required arg: <name>`.

## Package manager

Scripts that install dependencies need a package manager. ohstart searches from the current directory upwards until the home directory:

1. Reads the `packageManager` field of `package.json`, or `devEngines.packageManager`.
2. Otherwise looks for lock files: `pnpm-lock.yaml` for pnpm, `package-lock.json` / `npm-shrinkwrap.json` for npm, `yarn.lock` for yarn.
3. `bun.lockb` / `bun.lock` / `deno.lock` are treated as unsupported and require an explicit choice.
4. No match, or lock files from several package managers, also requires an explicit choice.

Specify it explicitly:

```bash
ohstart init --pnpm vite/react                    # direct choice
ohstart add --agent=yarn lint/eslint
ohstart init --no-detect --agent=pnpm vite/react  # skip detection, use the given value
```

Used alone, `--no-detect` neither detects nor specifies, leaving the script without a package manager; combine it with `--agent` to declare one.

## Working directory

Scripts run in the directory where the command is executed. To write into a particular project, change into that directory first.

## Next steps

- [Script Contract](../script/contract.md): requirements when modifying or writing scripts.
- [SDK Reference](../script/sdk.md): capabilities available inside scripts.
