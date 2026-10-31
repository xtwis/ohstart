<div align="center">

# @xtwis/ohstart-dev

Author-side toolchain for ohstart sources.

[![npm version](https://img.shields.io/npm/v/@xtwis/ohstart-dev)](https://www.npmjs.com/package/@xtwis/ohstart-dev)
[![CI](https://img.shields.io/github/actions/workflow/status/xtwis/ohstart/ci.yml?branch=main)](https://github.com/xtwis/ohstart/actions)
[![License](https://img.shields.io/npm/l/@xtwis/ohstart-dev)](./LICENSE)

</div>

```bash
ohsd check
```

- **Scaffold a Source**: `ohsd init` writes `ohstart.json`, the project config and a sample script in one go.
- **Contract Validation**: `ohsd check` verifies the source manifest, script metadata and entry files, then reports errors and warnings separately.
- **Local Working Directory**: `ohsd run` executes a script in `.ohstart` under the source root, with its own git repository and package manager project.
- **SDK for Script Authors**: `agent`, `log`, `prompt` and `defineArgv` are the entire surface a script may use.
- **Package Manager Abstraction**: Scripts drive npm, pnpm or yarn through one API, detected from the target project.
- **Zero Third-Party Runtime**: The SDK is injected by ohstart, so a script only needs it and the Node.js built-ins.

## Installation

```bash
pnpm add -g @xtwis/ohstart-dev
# or
npm install -g @xtwis/ohstart-dev
# or
yarn add -g @xtwis/ohstart-dev
```

Requires Node.js 22 or later.

## Quick Start

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

## SDK

A script imports the SDK by package name; ohstart rewrites the specifier to its own build when it bundles the script.

```ts
import { agent, log } from "@xtwis/ohstart-dev"

export default async function main() {
  log.out(`using ${agent.name ?? "unknown"}`)
  await agent.add(["eslint"], { dev: true })
}
```

```ts
import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({
  args: [{ name: "name", description: "Name to greet" }],
  flags: { path: { type: "string", description: "Directory to write into" } },
})
```

## Documentation

Full guides, command reference and examples live at:

- English: <https://x.twis.uk/en/ohstart/>
- 简体中文: <https://x.twis.uk/zh/ohstart/>

## Changelog

[CHANGELOG.md](./CHANGELOG.md)

## License

[MIT](./LICENSE)
