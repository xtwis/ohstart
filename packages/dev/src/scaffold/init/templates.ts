import { VERSION } from "@/version"

export function sourcePackageJson(): string {
  const body = {
    name: "ohstart-source",
    private: true,
    type: "module",
    scripts: {
      check: "tsc --noEmit",
    },
    devDependencies: {
      "@types/node": "^26.0.0",
      "@xtwis/ohstart-dev": `^${VERSION}`,
      "typescript": "^6.0.0",
    },
  }
  return `${JSON.stringify(body, null, 2)}\n`
}

export function sourceTsconfigJson(): string {
  const body = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      types: ["node"],
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ["**/*"],
    exclude: ["node_modules", ".ohstart"],
  }
  return `${JSON.stringify(body, null, 2)}\n`
}
