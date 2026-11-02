# @xtwis/ohstart-dev

## 1.0.2

### Patch Changes

- d19c895: Parse the `ohsd run` flags only before the script name
- 0b22282: Fix the semantics of `--no-git`
- 7b9e16a: Add `--no-package` to `ohsd run` to skip the package project in the working directory

## 1.0.1

### Patch Changes

- 8c2a9ba: Modified the site link of the documentation site

## 1.0.0

### Major Changes

- e43dfdb: Add README and complete the `package.json`

## 0.1.3

### Patch Changes

- 4a74e19: `version` prints the package name and build date in the command frame
- 1f758ab: Unify command output into one frame
- a198e0c: Drop `--` handling; flags are assigned by position only
- c58dd35: Replace the built-in prompt layer with `@clack/prompts`
- fee920d: Take over help rendering and report unknown commands in the command frame

## 0.1.2

### Patch Changes

- 3b346ea: Add short command aliases
- 7abf2c1: Fix interactive commands hanging after a prompt instead of exiting

## 0.1.1

### Patch Changes

- 85f1749: Add Changesets for release management
