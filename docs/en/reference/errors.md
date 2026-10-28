---
title: Error reference
order: 6
---

# {{ $frontmatter.title }}

This page maps error messages to their causes and remedies. `<...>` marks placeholder content.

Command failures write the message to stderr and exit with `1`; warnings only inform and do not change the exit code.

## Contract

| Message                                                                 | Cause                                                          | Fix                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| `ohstart.json: is not valid JSON`                                       | The file is not valid JSON                                     | Fix the JSON syntax                     |
| `ohstart.json: must be a JSON object`                                   | The root node is not an object                                 | Make it an object                       |
| `ohstart.json: name is required`                                        | `name` is missing or empty                                     | Provide the source name                 |
| `ohstart.json: "scripts" must be an object`                             | `scripts` is missing or not an object                          | Make it an object                       |
| `ohstart.json: script name must not be empty`                           | `scripts` contains an empty key                                | Give the script a name                  |
| `ohstart.json: scripts["<key>"] must be a string`                       | A mapped value is not a string                                 | Use a path relative to the source root  |
| `ohstart.json: "<field>" must be a string`                              | `name` / `author` / `description` missing or of the wrong type | Provide string fields                   |
| `script.json in <path>: is not valid JSON`                              | Script metadata is not valid JSON                              | Fix the JSON syntax                     |
| `script.json in <path>: name is required`                               | `name` is missing or empty                                     | Provide the script name                 |
| `script.json in <path>: "type" must be one of init, add, got "<value>"` | Invalid `type`                                                 | Use `init` or `add`                     |
| `script.json in <path>: "<field>" must be a string`                     | A required field is missing or of the wrong type               | Provide `name` / `type` / `description` |

## Script

| Message                                                            | Cause                                                                      | Fix                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------- |
| `unknown script: <name> in source <key>`                           | The name is not registered in `ohstart.json`                               | Check the name, or register the script   |
| `script.json name mismatch: <actual> != <expected>`                | `name` in `script.json` differs from the key                               | Make the two match                       |
| ``wrong script type: <name> is <type>, use `ohstart <type>` ``     | The command does not match the script type                                 | Use the matching command                 |
| `missing argv.ts: <name>`                                          | The argument definition file is missing                                    | Create `argv.ts` or fix the `argv` field |
| ``<file> must `export default defineArgv({ ... })`, got <actual>`` | The argument file does not export the result of `defineArgv`               | Default-export `defineArgv(...)`         |
| `<file> does not export an argv schema`                            | The export lacks `schema`                                                  | Same as above                            |
| `missing required arg: <name>`                                     | A required positional argument is missing in a non-interactive environment | Provide the argument                     |
| `script entry must default-export a function`                      | The entry file does not default-export a function                          | Use `export default async function`      |
| `failed to bundle <entry>: <reason>`                               | Bundling the entry failed, usually a syntax or import error                | Fix the code as the reason indicates     |

## Source

| Message                                                         | Cause                                                   | Fix                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `unknown source: <key>`                                         | The key does not exist in the configuration             | Check with `ohstart source list`, or add the source |
| `source <key> already exists`                                   | The key is taken                                        | Pick another key                                    |
| `a new key name is required`                                    | `source rename` was called without a new key            | Provide the new key                                 |
| `the new key name is the same as <key>`                         | Old and new keys match                                  | Pick another key                                    |
| ``no default source: run `ohstart source default <key>` first`` | No default source, and the address has no source prefix | Set a default source, or use `@<key>/<name>`        |
| `default source is not configured: <key>`                       | The default points to a missing key                     | Set the default source again                        |
| `invalid address: <address>, expected @<key>/<script>`          | Starts with `@` but is incomplete                       | Use `@<key>/<script>`                               |
| `failed to clone <url>`                                         | Clone failed, git stderr follows                        | Check the URL and access rights                     |
| `source is not trusted: <key>, pass --trust to allow this run`  | Non-interactive environment and an untrusted source     | Run `source trust` first, or pass `--trust`         |
| `aborted: source is not trusted: <key>`                         | The confirmation was declined                           | Confirm and retry, or trust the source              |

## Project

| Message                                                                                 | Cause                                                                   | Fix                                    |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------- |
| `not inside a git repository: <dir>`                                                    | The current directory is not in a git repository                        | Run `git init` first                   |
| ``no ohstart.json at the git root: <root>, run `ohsd init` first``                      | The repository root lacks `ohstart.json`                                | Run `ohsd init`, or check the root     |
| `<root> is not empty, init needs a directory without source files (...)`                | The target directory is not empty                                       | Use an empty directory, or clean it    |
| `path exists and is not a directory: <path>`                                            | The path exists but is not a directory                                  | Use another path                       |
| `<root> is the source root, create the script in a subdirectory: ohsd new <dir> <name>` | A script was created at the source root                                 | Use a subdirectory                     |
| `path is not inside the source: <path>`                                                 | The path escapes the source root                                        | Use a path inside the root             |
| `script already exists: <name>`                                                         | The name is registered                                                  | Pick another name                      |
| `script path is already used: <path> (owner: <name>)`                                   | The path belongs to another script                                      | Use another directory                  |
| `script directory is not empty: <path>`                                                 | The script directory is not empty                                       | Clean it, or use another directory     |
| `script directory does not exist: <key> -> <path>`                                      | The registered path is missing                                          | Create the directory, or fix the entry |
| `script path is not a directory: <key> -> <path>`                                       | The registered path is not a directory                                  | Use a directory path                   |
| `script entry does not exist: <key> -> <entry>`                                         | The entry file is missing                                               | Create `index.ts` or fix `entry`       |
| `script argv.ts does not exist: <key> -> <path>`                                        | The argument file is missing                                            | Create `argv.ts` or fix `argv`         |
| `script is not registered in ohstart.json: <key>`                                       | The given script is not registered                                      | Register it, or use another name       |
| `invalid script name: <name>`                                                           | The name contains whitespace, backslashes, colons or an invalid segment | Use a valid name                       |
| `script directory must not start with a dot: <path>`                                    | A path segment starts with `.`                                          | Use another directory                  |

## Command and package manager

| Message                                                                        | Cause                                                     | Fix                                             |
| ------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| `invalid script type: <value>, expected init or add`                           | Invalid type filter for `list`, or invalid type for `run` | Use `init` or `add`                             |
| `unexpected arguments: <args>`                                                 | `source add` received extra positional arguments          | Remove the extra arguments                      |
| `no package manager specified`                                                 | The script called `agent` without a package manager       | Pass `--npm` / `--pnpm` / `--yarn`              |
| `invalid package manager: <value>, expected npm, pnpm, or yarn`                | Invalid `--agent=` value                                  | Use one of the three                            |
| `option --agent requires a value: use --agent=<npm\|pnpm\|yarn>`               | `--agent` without a value                                 | Use `--agent=<name>`                            |
| `only one package manager can be specified: <flags>`                           | Several package manager flags at once                     | Keep a single one                               |
| `cannot detect the package manager in <dir>`                                   | Detection found nothing, nothing specified                | Specify a package manager, or add `--no-detect` |
| `detected an unsupported package manager: <name>, expected npm, pnpm, or yarn` | A bun or deno lock file was detected                      | Specify the package manager                     |
| `multiple lock files found: <files>`                                           | Several lock files of the same kind                       | Clean them up, or specify explicitly            |
| `cannot confirm the package manager without a tty`                             | Detection differs from the given value and cannot prompt  | Add `--no-detect`                               |
| `aborted: package manager was not confirmed`                                   | The confirmation was declined                             | Confirm and retry                               |
| `<command> failed with exit code <code>`                                       | A command run by `agent` exited non-zero                  | Investigate the terminal output                 |
| `failed to run <command>: <reason>`                                            | `agent` could not start the command                       | Make sure the package manager is installed      |

## Runtime

| Message                                                      | Cause                                                   | Fix                                   |
| ------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------- |
| `interactive prompt requires a tty`                          | Key-driven interaction in a non-interactive environment | Use a non-interactive path            |
| `no option to select from`                                   | An empty array was passed to a selection                | Fix the script                        |
| `stdin closed`                                               | Standard input is closed                                | Retry in an interactive terminal      |
| `cannot create the working directory .ohstart inside <root>` | The work directory cannot be resolved                   | Make sure the source root is writable |
| `refusing to clear: <dir> is a symbolic link`                | The work directory is a symbolic link                   | Remove the link                       |
| `refusing to clear: <dir> is not a directory`                | The work directory path is not a directory              | Remove the path                       |

## Warnings

| Message                                                                            | Trigger                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ``not a git repository yet: run `git init` before publishing this source``         | `ohsd init` ran outside a git repository                           |
| `skipping <name>: <reason>`                                                        | `ohstart list` skipped a broken script                             |
| `orphan <dir> has a script.json but is not registered in ohstart.json`             | `ohsd check` found an unregistered script directory                |
| `git init failed in <dir>, falling back to a minimal git skeleton`                 | `ohsd run` could not call git                                      |
| `package manager init failed in <dir>, falling back to a minimal package manifest` | Package manager init failed in the work directory                  |
| `detected an unsupported package manager: <name>, using <specified>`               | An unsupported package manager was detected; the given one is used |
| `multiple lock files found: <files>, using <specified>`                            | Conflicting lock files; the given package manager is used          |

## Next steps

- [ohstart CLI reference](./cli.md): commands and flags.
- [ohsd CLI reference](./dev.md): checks and the work directory.
- [Contract fields](./contracts.md): field-level constraints.
