---
title: Environment variables
order: 5
---

# {{ $frontmatter.title }}

ohstart passes values to scripts through three environment variables and uses them to control debug output.

| Variable        | Set by                 | Purpose                                       |
| --------------- | ---------------------- | --------------------------------------------- |
| `OHSTART_ARGV`  | `ohstart` / `ohsd run` | Arguments passed to the script, as JSON       |
| `OHSTART_AGENT` | `ohstart` / `ohsd run` | Package manager identity passed to the script |
| `OHSTART_DEBUG` | The user               | Any non-empty value enables debug logs        |

## OHSTART_ARGV

Written by ohstart when a script runs; the content is the parsed argument JSON:

```json
{
  "args": ["my-app"],
  "flags": { "template": "react-ts", "force": true }
}
```

| Field   | Type                                | Description                    |
| ------- | ----------------------------------- | ------------------------------ |
| `args`  | `string[]`                          | Positional arguments, in order |
| `flags` | `Record<string, string \| boolean>` | Flag names mapped to values    |

Scripts normally read values through `getArgv()` from `argv.ts` rather than the variable itself:

```ts
import argv from "./argv.js"

const { getArgv } = argv
const { args, flags } = getArgv()
```

When the variable is missing or holds invalid JSON, `getArgv()` returns `{ args: [], flags: {} }`. ohstart generates the content, so it never needs to be set by hand during a normal run.

## OHSTART_AGENT

Written by ohstart when a script runs; the content is a package manager identity:

| Form           | Example        |
| -------------- | -------------- |
| `name`         | `pnpm`         |
| `name@version` | `pnpm@11.24.0` |

The version comes from the detected `packageManager` field of `package.json` and is omitted when detection did not resolve one.

Scripts read it through the SDK `agent`:

```ts
import { agent } from "@xtwis/ohstart-dev"

if (agent.name) {
  await agent.install()
}
```

When the variable is not written, `agent.name` and `agent.version` are `undefined`, and methods such as `install` / `add` throw `no package manager specified`. Running with `--no-detect` and no explicit package manager is such a case.

## OHSTART_DEBUG

Any non-empty value enables debug logging to stderr:

```bash
OHSTART_DEBUG=1 ohstart init vite/react
```

Debug output adds the appended `.gitignore` content for `ohsd init` and the work directory path for `ohsd run`. `log.debug(...)` inside scripts also depends on it.

## Next steps

- [SDK reference](../script/sdk.md): reading these values from a script.
- [Local debugging](../script/debug.md): debugging workflow.
- [Package manager](../guide/scripts.md): detection and selection rules.
