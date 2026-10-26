import { terms } from "@shared/text/terms"

export const ignoredEntriesHint = ".git, .gitignore, .DS_Store, README*, LICENSE*"

export const error = {
  contract: {
    sourceNoName: "ohstart.json: name is required",
    sourceScriptsNotObject: "ohstart.json: \"scripts\" must be an object",
    sourceProblems: (problems: string): string => `ohstart.json: ${problems}`,
    scriptNameEmpty: "script name must not be empty",
    scriptPathNotString: (name: string): string => `scripts["${name}"] must be a string`,
    scriptNoName: (label: string): string => `${label}: name is required`,
    scriptBadType: (label: string, type: string): string => `${label}: "type" must be one of init, add, got "${type}"`,
    notValidJson: (label: string): string => `${label}: is not valid JSON`,
    notJsonObject: (label: string): string => `${label}: must be a JSON object`,
    fieldNotString: (label: string, fields: string[]): string =>
      `${label}: ${fields.map(field => `"${field}" must be a string`).join(", ")}`,
  },

  script: {
    nameMismatch: (actual: string, expected: string): string => `script.json name mismatch: ${actual} != ${expected}`,
    wrongType: (name: string, type: string, command: string): string =>
      `wrong ${terms.script} type: ${name} is ${type}, use \`${command} ${type}\``,
    unknown: (name: string, source: string): string => `unknown ${terms.script}: ${name} in ${terms.source} ${source}`,
    missingArgvFile: (name: string): string => `missing ${terms.argvFile}: ${name}`,
    argvNotDefineArgv: (file: string, actual: string): string =>
      `${file} must \`export default defineArgv({ ... })\`, got ${actual}`,
    argvNoSchema: (file: string): string => `${file} does not export an argv schema`,
    missingRequiredArg: (name: string): string => `missing required arg: ${name}`,
    entryNotFunction: "script entry must default-export a function",
    bundleFailed: (entry: string, reason: string): string => `failed to bundle ${entry}: ${reason}`,
  },

  source: {
    unknown: (key: string): string => `unknown ${terms.source}: ${key}`,
    noDefault: `no ${terms.defaultSource}: run \`ohstart source default <key>\` first`,
    defaultMissing: (key: string): string => `${terms.defaultSource} is not configured: ${key}`,
    invalidAddress: (address: string): string => `invalid address: ${address}, expected @<key>/<script>`,
    cloneFailed: (url: string, stderr?: string): string => `failed to clone ${url}${stderr ? `\n${stderr.trim()}` : ""}`,
    notTrusted: (key: string): string =>
      `${terms.source} is not ${terms.trusted}: ${key}, pass --trust to allow this run`,
    trustAborted: (key: string): string => `aborted: ${terms.source} is not ${terms.trusted}: ${key}`,
  },

  project: {
    root: {
      notEmpty: (root: string): string =>
        `${root} is not empty, init needs a directory without source files (${ignoredEntriesHint})`,
      isSourceRoot: (root: string): string =>
        `${root} is the ${terms.source} root, create the ${terms.script} in a subdirectory: ohsd new <dir> <name>`,
      pathOutsideSource: (path: string): string => `path is not inside the source: ${path}`,
      notADirectory: (dir: string): string => `path exists and is not a directory: ${dir}`,
      notInGitRepo: (dir: string): string => `not inside a git repository: ${dir}`,
      noOhstartJson: (root: string): string => `no ohstart.json at the git root: ${root}, run \`ohsd init\` first`,
    },
    skeleton: {
      exists: (name: string): string => `${terms.script} already exists: ${name}`,
      pathUsed: (path: string, owner?: string): string =>
        `${terms.script} path is already used: ${path}${owner ? ` (owner: ${owner})` : ""}`,
      dirNotEmpty: (path: string): string => `${terms.script} directory is not empty: ${path}`,
      dirMissing: (key: string, path: string): string => `${terms.script} directory does not exist: ${key} -> ${path}`,
      pathNotDir: (key: string, path: string): string => `${terms.script} path is not a directory: ${key} -> ${path}`,
      entryMissing: (key: string, entry: string): string => `${terms.script} entry does not exist: ${key} -> ${entry}`,
      argvMissing: (key: string, argv: string): string => `${terms.script} ${terms.argvFile} does not exist: ${key} -> ${argv}`,
      notRegistered: (key: string): string => `${terms.script} is not registered in ohstart.json: ${key}`,
      invalidName: (name: string): string => `invalid ${terms.script} name: ${name}`,
      dotPrefixed: (path: string): string => `${terms.script} directory must not start with a dot: ${path}`,
    },
  },

  command: {
    invalidScriptType: (type: string): string => `invalid ${terms.script} type: ${type}, expected init or add`,
    unexpectedArguments: (args: string): string => `unexpected arguments: ${args}`,
  },

  agent: {
    notSpecified: `no ${terms.packageManager} specified`,
    invalidAgent: (agent: string): string => `invalid ${terms.packageManager}: ${agent}, expected npm, pnpm, or yarn`,
    commandFailed: (command: string, exitCode: number): string => `${command} failed with exit code ${exitCode}`,
    spawnFailed: (command: string, reason: string): string => `failed to run ${command}: ${reason}`,
    multipleSpecified: (sources: string): string => `only one ${terms.packageManager} can be specified: ${sources}`,
    missingAgentValue: "option --agent requires a value: use --agent=<npm|pnpm|yarn>",
    notDetected: (cwd: string): string =>
      `cannot detect the ${terms.packageManager} in ${cwd}\npass --agent=<npm|pnpm|yarn> to choose one, or --no-detect if the script does not need one`,
    unsupportedDetected: (name: string): string => `detected an unsupported ${terms.packageManager}: ${name}, expected npm, pnpm, or yarn`,
    multipleLockFiles: (files: string): string =>
      `multiple lock files found: ${files}\npass --agent=<npm|pnpm|yarn> to choose one`,
    requiresTty: `cannot confirm the ${terms.packageManager} without a tty\npass --no-detect to use the specified ${terms.packageManager} without detection`,
    aborted: `aborted: ${terms.packageManager} was not confirmed`,
  },

  runtime: {
    noOptions: "no option to select from",
    requiresTty: "interactive prompt requires a tty",
    stdinClosed: "stdin closed",
    cannotCreateWorkDir: (root: string): string => `cannot create the working directory ${terms.workDir} inside ${root}`,
    refuseSymlink: (dir: string): string => `refusing to clear: ${dir} is a symbolic link`,
    refuseNotDir: (dir: string): string => `refusing to clear: ${dir} is not a directory`,
  },
} as const
