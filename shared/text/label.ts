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

  command: {
    cliAdd: "ohstart add",
    cliInit: "ohstart init",
    cliList: "ohstart list",
    cliUpdate: "ohstart update",
    cliView: "ohstart view",
    devCheck: "ohstart-dev check",
    devInit: "ohstart-dev init",
    devNew: "ohstart-dev new",
    devRun: "ohstart-dev run",
    sourceAdd: "ohstart source add",
    sourceDefault: "ohstart source default",
    sourceList: "ohstart source list",
    sourceRemove: "ohstart source remove",
    sourceRename: "ohstart source rename",
    sourceTrust: "ohstart source trust",
    sourceUntrust: "ohstart source untrust",
    sourceView: "ohstart source view",
  },
} as const
