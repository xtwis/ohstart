---
title: Contract fields
order: 3
---

# {{ $frontmatter.title }}

The contract consists of two JSON files: `ohstart.json` at the source root declares which scripts exist, and `script.json` inside a script directory declares that script metadata.

## The two files

| File           | Location         | Purpose                                                               |
| -------------- | ---------------- | --------------------------------------------------------------------- |
| `ohstart.json` | Source root      | Maps script names to script paths                                     |
| `script.json`  | Script directory | Holds the name, type, description and file entry points of one script |

Script directories come from the `ohstart.json` mapping; `script.json` only applies inside its own directory.

## ohstart.json

```json
{
  "name": "my-templates",
  "author": "your-name",
  "description": "team templates",
  "scripts": {
    "sayhi": "sayhi",
    "lint/eslint": "lint/eslint"
  }
}
```

| Field         | Type     | Required | Description                                    |
| ------------- | -------- | -------- | ---------------------------------------------- |
| `name`        | `string` | Yes      | Source name, must not be empty                 |
| `author`      | `string` | Yes      | Author, may be an empty string                 |
| `description` | `string` | Yes      | Source description, may be empty               |
| `scripts`     | `object` | Yes      | Keys are script names, values are script paths |

Constraints:

- The file must be a JSON object.
- `name`, `author` and `description` fail validation when missing or not strings.
- `scripts` fails validation when missing or not an object.
- Keys of `scripts` must not be empty strings, and values must be strings.
- Values are paths relative to the source root and must stay inside it.
- One path must not map to two script names; only `ohsd check` enforces this.
- Keys and values need not match: the key is the name used for invocation, the value is the directory of that script. Both may contain `/` for grouping.

`ohsd new` keeps only the four fields above when writing the file back; anything else is dropped.

## script.json

```json
{
  "name": "lint/eslint",
  "type": "add",
  "description": "install an eslint config",
  "entry": "index.ts",
  "argv": "argv.ts"
}
```

| Field         | Type                | Required | Description                                       |
| ------------- | ------------------- | -------- | ------------------------------------------------- |
| `name`        | `string`            | Yes      | Script name, must match the key in `ohstart.json` |
| `type`        | `"init"` \| `"add"` | Yes      | Decides whether `init` or `add` runs it           |
| `description` | `string`            | Yes      | One-line description shown by `ohstart list`      |
| `entry`       | `string`            | No       | Entry file, defaults to `index.ts`                |
| `argv`        | `string`            | No       | Argument definition file, defaults to `argv.ts`   |

Constraints:

- The file must be a JSON object.
- `name`, `type` and `description` fail validation when missing or not strings.
- `name` must not be empty and must match the registered key exactly.
- `type` is `init` or `add`; other values fail.
- When `entry` and `argv` are omitted, the default file names are used; given values are relative to the script directory.
- The presence of the entry and argv files is checked by `ohsd check` and at run time, not while parsing this file.

## Default files

| Name       | Constant | Purpose                                                                  |
| ---------- | -------- | ------------------------------------------------------------------------ |
| `index.ts` | `entry`  | Bundled and executed entry, must default-export a function               |
| `argv.ts`  | `argv`   | Argument definition, must default-export the result of `defineArgv(...)` |

Implementation requirements for the entry and the argument definition are covered in [Script contract](../script/contract.md).

## Validation timing

| Scenario                        | Content read                                          |
| ------------------------------- | ----------------------------------------------------- |
| `ohstart source add`            | `name` from `ohstart.json`                            |
| `ohstart list`                  | Both files; a broken script is skipped with a warning |
| `ohstart init` / `add` / `view` | Both files and the target script; any error aborts    |
| `ohsd new`                      | `ohstart.json`, plus duplicate name and path checks   |
| `ohsd check`                    | Everything, reporting errors and warnings             |

See [Error reference](./errors.md) for messages and remedies.

## Next steps

- [Script contract](../script/contract.md): directory layout, entry and argument definitions.
- [Configuration file](./config.md): local source configuration.
- [Error reference](./errors.md): contract-related messages.
