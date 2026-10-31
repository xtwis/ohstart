<div align="center">

# ohstart

Install your configuration in one command.

[![CI](https://img.shields.io/github/actions/workflow/status/xtwis/ohstart/ci.yml?branch=main)](https://github.com/xtwis/ohstart/actions)
[![License](https://img.shields.io/npm/l/@xtwis/ohstart)](./LICENSE)

</div>

```bash
ohstart init vite/react
```

- **No Official Source**: Templates are hosted by you or your team.
- **Templates as Code**: Written in TypeScript, no custom syntax.
- **Init and Suite Stay Apart**: `init` creates projects, `add` installs suites, never mixed.
- **Trust Gate for Sources**: Unknown sources are blocked by default.
- **No Release Step**: Sources live in git, never published to npm.
- **Complete Toolchain**: One toolkit to initialize, check and test your templates.

## Packages

| Package                                | Binaries              | Purpose                                                                  |
| -------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| [`@xtwis/ohstart`](./packages/cli)     | `ohstart`, `ohs`      | User-facing CLI: register sources, list scripts, run `init` and `add`    |
| [`@xtwis/ohstart-dev`](./packages/dev) | `ohstart-dev`, `ohsd` | Author-side CLI: scaffold, validate and try scripts, plus the script SDK |

## Installation

```bash
pnpm add -g @xtwis/ohstart
# or
npm install -g @xtwis/ohstart
# or
yarn add -g @xtwis/ohstart
```

Requires Node.js 22 or later, plus a git client, which ohstart uses to fetch sources.

Authors of a source also want the companion package:

```bash
pnpm add -g @xtwis/ohstart-dev
```

## Quick Start

Initialize a project from your templates, or install a suite.

```bash
# register a source
ohstart source add https://github.com/<org>/<repo>

# make it the default, so script names resolve against it
ohstart source default my-team

# list the scripts it provides
ohstart list

# initialize a project from an init script
ohstart init vite/react

# install a suite into the current project
ohstart add lint/eslint
```

A script is addressed either by name, which resolves against the default source, or by `@<key>/<name>`, which resolves against a specific one.

## Concepts

ohstart has three concepts, everything else is a combination of them.

| Concept | What it is                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------- |
| Source  | A git repository. Its root `ohstart.json` lists every script it provides.                            |
| Script  | A directory in a source, with a `script.json`, an `index.ts` entry and an `argv.ts` argument schema. |
| Trust   | A gate that has to be passed before a source is allowed to run code on your machine.                 |

Scripts come in two types, and the two never mix: `init` creates a project, `add` installs a suite into an existing one.

## Authoring a Source

```bash
# create a source skeleton
ohsd init my-templates

# add a script skeleton to an existing source
ohsd new lint/eslint lint/eslint --type add

# validate the source contract
ohsd check

# try a script in the working directory
ohsd run add lint/eslint
```

A script imports the SDK by package name; ohstart rewrites the specifier to its own build when it bundles the script.

```ts
import { agent, log } from "@xtwis/ohstart-dev"

export default async function main() {
  log.out(`using ${agent.name ?? "unknown"}`)
  await agent.add(["eslint"], { dev: true })
}
```

## Documentation

Full guides, command reference and examples live at:

- English: <https://x.twis.uk/ohstart>
- 简体中文: <https://x.twis.uk/zh/ohstart>

## License

[MIT](./LICENSE)
