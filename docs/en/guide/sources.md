---
title: Managing Sources
order: 3
---

# {{ $frontmatter.title }}

The source command group covers adding, inspecting and removing sources, setting the default source, and managing trust.

## Command overview

| Command                                 | Alias                                | Purpose                        |
| --------------------------------------- | ------------------------------------ | ------------------------------ |
| `ohstart source add <url>`              |                                      | Add a source                   |
| `ohstart source list`                   | `ohstart src ls`                     | List configured sources        |
| `ohstart source view <key>`             |                                      | Show source details            |
| `ohstart source default [key]`          | `ohstart src def`                    | Show or set the default source |
| `ohstart source note <key> [text]`      |                                      | Show or set the note           |
| `ohstart source rename <key> [new-key]` | `ohstart src ren` / `ohstart src mv` | Rename a key                   |
| `ohstart source remove <key>`           | `ohstart src rm`                     | Remove a source                |
| `ohstart source trust <key>`            |                                      | Mark as trusted                |
| `ohstart source untrust <key>`          |                                      | Revoke trust                   |

## Adding a source

```bash
ohstart source add https://github.com/<org>/<repo>
```

ohstart clones the repository and reads its `ohstart.json`, then:

- Uses the source `name` as the key by default; `--key <key>` overrides it.
- Asks for another key while the chosen one is taken, until an unused key is given.
- Writes a local note with `--note "<note>"`, visible only to you.
- Marks the source as trusted at the same time with `--trust`.

```
enter another key name for source templates?
```

The result:

```
ohstart source add
┌  add a source
│
◇  added source my-team (templates) -> https://github.com/<org>/<repo>
│
●
```

## Listing sources

```bash
ohstart source list
```

```
ohstart source list
┌  list configured sources
│
◇  *    my-team (trusted)    templates    https://github.com/<org>/<repo>
│       other               templates    https://github.com/<other>/<repo>
│
●
```

- A leading `*` marks the default source.
- `(trusted)` marks a trusted source.

## Viewing a source

```bash
ohstart source view my-team
```

```
ohstart source view
┌  show the details of a source
│
◇  key        my-team
│  name       templates
│  url        https://github.com/<org>/<repo>
│  trust      true
│  note       team templates
│  default    true
│
●
```

## Default source

The default source decides which source receives script addresses without `@`. Inspect it:

```bash
ohstart source default
```

Set it:

```bash
ohstart source default my-team
```

Running a script with no default source fails immediately and asks you to set one.

## Note

```bash
ohstart source note my-team
ohstart source note my-team "team templates"
ohstart source note my-team --unset
```

The note lives in the local configuration only and does not follow source updates. Without text it reads the current note, with text it writes it, and `--unset` clears it. Clearing requires `--unset`: "unset" and "empty string" are two different states in the configuration.

## Renaming a key

```bash
ohstart source rename my-team team-templates
```

The key only affects local addressing and is unrelated to the repository name. A key that is already taken, or identical to the current one, is rejected. Renaming the default source updates the default accordingly.

## Removing a source

```bash
ohstart source remove my-team
```

Confirmation is required. Removal only touches **local configuration**; the remote repository is unaffected. Removing the default source also clears the default setting.

## Trust

Trust gates script execution, and every source needs confirmation once by default.

```bash
ohstart source trust my-team     # mark as trusted
ohstart source untrust my-team   # revoke trust
```

Three ways through the gate:

| Situation                                | Behavior                                                   |
| ---------------------------------------- | ---------------------------------------------------------- |
| Source marked trusted                    | Runs directly                                              |
| Not trusted, interactive terminal        | Asked once, and acceptance is written to the configuration |
| Not trusted, non-interactive environment | Fails immediately; add `--trust` to allow the run          |

`--trust` applies to the current run only and is never written to the configuration:

```bash
ohstart init --trust @my-team/vite/react
```

## Next steps

- [Running Scripts](./scripts.md): executing scripts once sources are configured.
- [Configuration file](../reference/config.md): every configuration field.
