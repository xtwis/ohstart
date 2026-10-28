---
title: ohstart CLI reference
order: 1
---

# {{ $frontmatter.title }}

`ohstart` is the user-facing command. The binary is `ohstart`, with `ohs` as an alias. This page lists every command with its arguments and output.

## Command overview

| Command                          | Alias | Purpose                            |
| -------------------------------- | ----- | ---------------------------------- |
| `ohstart init <script> [arg...]` | -     | Run an `init` script               |
| `ohstart add <script> [arg...]`  | -     | Run an `add` script                |
| `ohstart list [type]`            | `ls`  | List scripts in the default source |
| `ohstart view <script>`          | -     | Show script metadata               |
| `ohstart source <subcommand>`    | `src` | Manage sources                     |
| `ohstart version`                | `ver` | Print the version                  |
| `ohstart help`                   | -     | Print usage                        |

Without a subcommand, `help` runs. `update` is registered but has no implementation; running it does nothing.

## init / add

```
ohstart init <script> [arg...]
ohstart add <script> [arg...]
```

The two commands differ only in script type: `init` runs `init` scripts, `add` runs `add` scripts. A mismatch fails with an error that names the command to use instead.

`<script>` accepts two forms:

| Form            | Resolution                                                            |
| --------------- | --------------------------------------------------------------------- |
| `name`          | Looked up in the default source                                       |
| `@<key>/<name>` | Looked up in the source registered as `key`; the name may contain `/` |

Everything after the script name is handed to the script; `ohstart` does not parse it. These flags are consumed by `ohstart` itself:

| Flag                          | Position                        | Effect                                                       |
| ----------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `--trust`                     | Before or after the script name | Skip the trust confirmation for this run, without persisting |
| `--npm` / `--pnpm` / `--yarn` | Before the script name          | Select the package manager                                   |
| `--agent=<npm\|pnpm\|yarn>`   | Before the script name          | Same, in assignment form                                     |
| `--no-detect`                 | Before the script name          | Skip package manager detection                               |

Package manager flags must precede the script name; after it they belong to the script. `--trust` is the exception and is recognized on either side.

When the source is untrusted and the terminal is not interactive, the run fails instead of prompting. See [Managing Sources](../guide/sources.md) for the trust model.

If the script exits with a non-zero code, that code becomes the exit code of `ohstart`.

## list

```
ohstart list [type]
```

Reads the default source only; a source cannot be specified.

| Argument | Required | Description                                      |
| -------- | -------- | ------------------------------------------------ |
| `type`   | No       | `init` or `add`; lists every script when omitted |

Each line prints the script type, name and description, sorted by name:

```
add  lint/eslint   install an eslint config
init vite/react    create a React project
```

A broken script directory does not stop the listing; it is skipped with the warning `skipping <name>: <reason>`. With no matching scripts the output is `no script in source <key>`.

## view

```
ohstart view <script>
```

Prints seven metadata fields, where `usage` is generated from the argument definition:

```
name: lint/eslint
type: add
description: install an eslint config
path: lint/eslint
entry: index.ts
argv: argv.ts
usage: ohstart add lint/eslint [--fix <value>]
```

`usage` always starts with `ohstart <type> <name>`, renders positional arguments as `<name>`, wraps optional positionals and flags in square brackets, and omits any `@<key>/` prefix.

## source

`source` manages the sources configured on this machine:

| Subcommand                              | Alias       | Purpose                        |
| --------------------------------------- | ----------- | ------------------------------ |
| `ohstart source add <url>`              | -           | Add a source                   |
| `ohstart source list`                   | `ls`        | List configured sources        |
| `ohstart source view <key>`             | -           | Show source details            |
| `ohstart source default [key]`          | `def`       | Show or set the default source |
| `ohstart source rename <key> <new-key>` | `ren`, `mv` | Rename a source                |
| `ohstart source remove <key>`           | `rm`        | Remove a source                |
| `ohstart source trust <key>`            | -           | Mark as trusted                |
| `ohstart source untrust <key>`          | -           | Revoke trust                   |

### add

```
ohstart source add <url> [--key <key>] [--note <text>] [--trust]
```

| Argument or flag | Required | Description                                                |
| ---------------- | -------- | ---------------------------------------------------------- |
| `url`            | Yes      | Git URL of the source                                      |
| `--key`          | No       | Local key; defaults to `name` in the source `ohstart.json` |
| `--note`         | No       | Local note                                                 |
| `--trust`        | No       | Mark the source as trusted on add                          |

Adding clones the source and reads its `ohstart.json` for the source name. When the key is taken, the command asks for another one:

```
enter another key name for source <key>?
```

Success prints `added source <key> (<source name>) -> <url>`.

### list

```
ohstart source list
```

Each line holds the default marker, key, source name and URL. The default source is marked with `*`, and trusted sources append `(trusted)`:

```
* my-team (trusted)  templates  git@github.com:team/templates.git
  personal           mine       https://example.com/mine.git
```

With no sources configured the output is `no source configured`.

### view

```
ohstart source view <key>
```

Prints six fields:

```
key: my-team
name: templates
url: git@github.com:team/templates.git
trust: true
note: team templates
default: true
```

`note` is empty when unset; `trust` and `default` print `true` or `false`.

### default

```
ohstart source default [key]
```

Without a key it prints the configured default source, or `no default source` when none is set. With a key it checks that the source exists, writes the change, and prints `default source is now <key>`.

### rename

```
ohstart source rename <key> <new-key>
```

The new key is required and must differ from the old one and be unused. If the old key was the default source, the default follows the rename. Success prints `renamed source <old> to <new>`.

### remove

```
ohstart source remove <key>
```

Asks for confirmation first:

```
remove source <key>? [y/N]
```

On confirmation the entry is deleted; if it was the default source, the default is cleared as well. Declining prints `cancelled`, and success prints `removed source <key>`.

### trust / untrust

```
ohstart source trust <key>
ohstart source untrust <key>
```

They print `source <key> is now trusted` and `source <key> is no longer trusted` respectively.

## version

```
ohstart version
```

Prints the current version.

## Exit codes

| Case                   | Exit code                       |
| ---------------------- | ------------------------------- |
| Command succeeded      | `0`                             |
| Command failed         | `1`, with the message on stderr |
| Script exited non-zero | The exit code of the script     |

## Next steps

- [ohsd CLI reference](./dev.md): commands for source authors.
- [Contract fields](./contracts.md): fields of `ohstart.json` and `script.json`.
- [Managing Sources](../guide/sources.md): adding, renaming and trusting sources.
