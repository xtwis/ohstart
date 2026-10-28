---
title: Configuration file
order: 4
---

# {{ $frontmatter.title }}

Local source configuration lives in `config.json`, which records the added sources and the default source.

## Location

| Condition                | Path                                   |
| ------------------------ | -------------------------------------- |
| `XDG_CONFIG_HOME` is set | `$XDG_CONFIG_HOME/ohstart/config.json` |
| Windows                  | `%APPDATA%\ohstart\config.json`        |
| Other platforms          | `~/.config/ohstart/config.json`        |

`XDG_CONFIG_HOME` takes precedence over the platform default, on Windows as well. When `APPDATA` is unset, `~/AppData/Roaming` is used.

## Structure

```json
{
  "source": {
    "my-team": {
      "name": "templates",
      "url": "git@github.com:team/templates.git",
      "trust": true,
      "note": "team templates"
    }
  },
  "default": "my-team"
}
```

### source

The key is the local key name, the value is that source configuration.

| Field   | Type      | Required | Description                                        |
| ------- | --------- | -------- | -------------------------------------------------- |
| `name`  | `string`  | Yes      | Source name declared in its `ohstart.json`         |
| `url`   | `string`  | Yes      | Git URL of the source, passed to `git clone` as-is |
| `trust` | `boolean` | No       | When `true`, the trust confirmation is skipped     |
| `note`  | `string`  | No       | Local note                                         |

### default

Key name of the default source. When absent, no default source is set, and `ohstart init` / `add` / `list` / `view` require a `@<key>/` prefix on the script address, otherwise they fail.

## Read and write behavior

| Behavior        | Description                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| File missing    | Treated as an empty configuration without an error; the directory and file are created on first write |
| Write format    | JSON indented by two spaces with a trailing newline                                                   |
| Immediate write | `source add` / `remove` / `rename` / `trust` / `untrust` / `default` all write at once                |
| Runtime write   | After a trust confirmation, that source `trust` becomes `true` and is written back                    |
| Read validation | No field validation; invalid content surfaces as a JSON parse error                                   |

The file is plain text and holds no credentials. Access to a source is decided by git itself.

## Next steps

- [Managing Sources](../guide/sources.md): maintaining the configuration through commands.
- [ohstart CLI reference](./cli.md): arguments of each `source` subcommand.
