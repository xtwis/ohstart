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
