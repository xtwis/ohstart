export const next = {
  sourceSteps: "next: pnpm install | pnpm check | ohsd new <dir> --type add | ohsd check",
  checkSteps: (name: string): string => `next: ohsd check ${name}`,
} as const
