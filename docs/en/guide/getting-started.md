---
title: Getting Started
order: 1
---

# {{ $frontmatter.title }}

This page adds a source and runs the first script it provides. The whole flow takes less than five minutes.

## Installation

ohstart is installed as a global command, independent of the package manager in use:

```bash
# pnpm
pnpm add -g @xtwis/ohstart

# npm
npm install -g @xtwis/ohstart

# yarn
yarn global add @xtwis/ohstart
```

Two executables are provided after installation: `ohstart` and the short alias `ohs`, which are equivalent.

**Requirements.** Node 22 or higher, plus a git client, which ohstart uses to fetch sources.

## Adding a source

A source is a git repository that contains a set of scripts. Pass the repository URL to ohstart:

```bash
ohstart source add https://github.com/<org>/<repo>
```

The command performs three steps:

1. Fetches the repository into a temporary directory with `git clone --depth 1`.
2. Reads `ohstart.json` at the repository root and uses its source name as the local key.
3. Writes the source into the configuration file.

When the key is already taken, ohstart asks for another one:

```
enter another key name for source templates? my-team
added source my-team (templates) -> https://github.com/<org>/<repo>
```

Use `--key` to specify the key directly, and `--note` to attach a local note.

## Setting the default source

A source can be marked as default; afterwards `ohstart init <script>` resolves to it:

```bash
ohstart source default my-team
```

Without arguments, the command prints the current default source:

```bash
ohstart source default
```

## Listing scripts

```bash
ohstart list
```

```
add  sayhi     Sample add script: write hello.md in the working directory
init vite/react  Scaffold a React project
```

`list` reads the **default source** only. To inspect another source, switch the default first, or use `ohstart view` for a specific script.

Filter by type:

```bash
ohstart list init
ohstart list add
```

## Running a script

Initialization scripts use `init`, installation scripts use `add`:

```bash
ohstart init vite/react
```

The first run of a script from a given source asks for confirmation of the source trust:

```
source my-team (templates) is not trusted: https://github.com/<org>/<repo>
sources from this source run arbitrary code, continue? [y/N]
```

Once confirmed, the trust state is recorded and no further confirmation is required. The script runs in the **current directory**.

ohstart flags go before the script name, script arguments go after it:

```bash
ohstart init --trust vite/react my-app --template react-ts
```

In the example above, `--trust` is handled by ohstart, while `my-app` and `--template react-ts` are passed to the `vite/react` script.

## Next steps

- [Core Concepts](./concepts.md): how sources, scripts and trust fit together.
- [Managing Sources](./sources.md): the full source command group.
- [Running Scripts](./scripts.md): argument passing and package manager selection.
