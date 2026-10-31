export const label = {
  field: {
    name: "name",
    type: "type",
    description: "description",
    path: "path",
    entry: "entry",
    argv: "argv",
    usage: "usage",
    key: "key",
    url: "url",
    trust: "trust",
    note: "note",
    default: "default",
    scriptsRegistered: "scripts registered",
  },

  option: {
    init: "init",
    add: "add",
  },

  mark: {
    trusted: "trusted",
    severityError: "error",
    severityWarning: "warning",
  },

  heading: {
    usage: "USAGE",
    arguments: "ARGUMENTS",
    options: "OPTIONS",
    commands: "COMMANDS",
  },

  hint: {
    help: (command: string): string => `use ${command} <command> --help for more information about a command`,
  },

  command: {
    cliAdd: "ohstart add",
    cliInit: "ohstart init",
    cliList: "ohstart list",
    cliVersion: "ohstart version",
    cliView: "ohstart view",
    devCheck: "ohstart-dev check",
    devInit: "ohstart-dev init",
    devNew: "ohstart-dev new",
    devRun: "ohstart-dev run",
    devVersion: "ohstart-dev version",
    sourceAdd: "ohstart source add",
    sourceDefault: "ohstart source default",
    sourceList: "ohstart source list",
    sourceNote: "ohstart source note",
    sourceRemove: "ohstart source remove",
    sourceRename: "ohstart source rename",
    sourceTrust: "ohstart source trust",
    sourceUntrust: "ohstart source untrust",
    sourceView: "ohstart source view",
  },
} as const
