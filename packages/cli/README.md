<div align="center">

# @xtwis/ohstart

Install your configuration in one command.

[![npm version](https://img.shields.io/npm/v/@xtwis/ohstart)](https://www.npmjs.com/package/@xtwis/ohstart)
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

## Installation

```bash
pnpm add -g @xtwis/ohstart
# or
npm install -g @xtwis/ohstart
# or
yarn add -g @xtwis/ohstart
```

Requires Node.js 22 or later.

Authors of a source also want the companion package, which scaffolds, validates and tries scripts:

```bash
pnpm add -g @xtwis/ohstart-dev
```

## Quick Start

Initialize a project from your templates, or install a suite.

```bash
# register a source
ohstart source add https://github.com/<org>/<repo>

# list the scripts it provides
ohstart list

# initialize a project from an init script
ohstart init vite/react

# install a suite into the current project
ohstart add lint/eslint
```

A script is addressed either by name, which resolves against the default source, or by `@<key>/<name>`, which resolves against a specific one.

## Documentation

Full guides, command reference and examples live at:

- English: <https://x.twis.uk/en/ohstart/>
- 简体中文: <https://x.twis.uk/zh/ohstart/>

## Changelog

[CHANGELOG.md](./CHANGELOG.md)

## License

[MIT](./LICENSE)
