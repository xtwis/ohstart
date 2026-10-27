---
title: SDK 参考
order: 3
---

# {{ $frontmatter.title }}

脚本运行时只能依赖 SDK 导出的能力, 本页按导出逐项说明.

## 导出总览

SDK 的公开面很小, 全部导出如下:

```ts
import { agent, defineArgv, log, prompt } from "@xtwis/ohstart-dev"
```

| 导出         | 类型 | 作用                                       |
| ------------ | ---- | ------------------------------------------ |
| `log`        | 对象 | 输出信息, 警告, 错误与调试日志             |
| `prompt`     | 对象 | 用户交互: 输入, 确认, 单选, 多选           |
| `agent`      | 对象 | 操作包管理器: 安装依赖, 执行脚本, 执行命令 |
| `defineArgv` | 函数 | 定义脚本参数                               |

同时导出类型: `Agent`, `AgentIdentity`, `AgentName`, `AgentOptions`, `AgentResult`.

## 源仓库的依赖

SDK 由 ohstart 在打包时注入, 因此执行脚本前无需在源仓库安装依赖. 脚本中直接写 `import { log } from "@xtwis/ohstart-dev"` 即可, 该包名会在打包时被重写为自带实现.

对应的限制是脚本只能使用 SDK 导出的能力与 Node 内置模块, 无法引入第三方依赖.

## 日志

`log` 负责向终端输出信息, 警告, 错误与调试日志:

```ts
log.info("hello")
log.warn("careful")
log.error("something broke")
log.debug("only shown with OHSTART_DEBUG")
```

`info` 写入 stdout, `warn` 与 `error` 写入 stderr. `debug` 仅在环境变量 `OHSTART_DEBUG` 存在时输出.

## 交互

`prompt` 负责与用户交互, 提供输入, 确认, 单选与多选:

```ts
const name = await prompt.input("Your name")
const ok = await prompt.confirm("Continue?")
const one = await prompt.select("Pick one", [{ label: "A" }, { label: "B" }])
const many = await prompt.multiselect("Pick some", [{ label: "A" }, { label: "B" }])
```

| 方法          | 参数                                | 返回       |
| ------------- | ----------------------------------- | ---------- |
| `input`       | `(提示语, { default?, validate? })` | `string`   |
| `confirm`     | `(提示语, { default? })`            | `boolean`  |
| `select`      | `(提示语, 选项数组)`                | `string`   |
| `multiselect` | `(提示语, 选项数组)`                | `string[]` |

选项项结构为 `{ label, value? }`, 未提供 `value` 时使用 `label`.

`input` 的 `validate` 返回 `true` 表示通过, 返回字符串表示不通过, 该字符串会展示给用户.

```ts
const name = await prompt.input("Your name", {
  validate: value => value.trim().length > 0 || "name is required",
})
```

`select` 与 `multiselect` 依赖按键交互, 需要终端支持 raw mode, 非交互环境中直接报错.

## 包管理器

`agent` 负责操作当前项目的包管理器, 无需自行判断是 npm, pnpm 还是 yarn. 具体值可读 `agent.name` 与 `agent.version`.

### 方法

```ts
await agent.install()
await agent.add("eslint", { dev: true })
await agent.remove(["typescript"])
await agent.run("build", ["--watch"])
await agent.execute("git", ["status"])
await agent.dlx("create-vite", ["my-app"])
await agent.resolve("pnpm", "dlx", "create-vite")
```

| 方法                  | npm                        | pnpm / yarn                                            |
| --------------------- | -------------------------- | ------------------------------------------------------ |
| `install()`           | `npm install`              | `pnpm install` / `yarn install`                        |
| `add(包名)`           | `npm install <包名>`       | `pnpm add <包名>` / `yarn add <包名>`                  |
| `remove(包名)`        | `npm uninstall <包名>`     | `pnpm remove <包名>` / `yarn remove <包名>`            |
| `run(脚本, 参数)`     | `npm run <脚本> -- <参数>` | `pnpm run <脚本> -- <参数>` / `yarn run <脚本> <参数>` |
| `execute(命令, 参数)` | `npm exec -- <命令>`       | `pnpm exec <命令>` / `yarn <命令>`                     |
| `dlx(包名, 参数)`     | `npx <包名>`               | `pnpm dlx <包名>` / `yarn dlx <包名>`                  |

`add` 与 `remove` 同时接受字符串与字符串数组.

`resolve(包管理器, ...参数)` 绕过当前选择, 直接以指定的包管理器执行原始命令, 上例等价于执行 `pnpm dlx create-vite`.

### 选项

```ts
await agent.add(["vitest"], { dev: true, ignoreScripts: true })
```

| 选项            | 作用                                                    |
| --------------- | ------------------------------------------------------- |
| `dev`           | 作为开发依赖安装, 对应 `-D`                             |
| `ignoreScripts` | 追加 `--ignore-scripts`                                 |
| `throwOnError`  | 默认 `true`, 命令失败即抛错. 设为 `false` 时仅返回结果. |

### 返回值

```ts
const result = await agent.run("build")
// { exitCode: number, stdout: string, stderr: string }
```

命令输出直接写入终端, 返回值中的 `stdout` 与 `stderr` 通常为空, 主要关注 `exitCode`.

### 失败处理

命令失败时抛出异常, 实例携带 `exitCode`, `stdout`, `stderr`, `command` 四个属性:

```ts
try {
  await agent.install()
}
catch (error) {
  if (error instanceof Error && "exitCode" in error)
    log.error(`install failed with ${error.exitCode}`)
}
```

`AgentError` 未从 SDK 导出, 因此按属性判断, 不要按类名导入.

## 下一步

- [本地调试](./debug.md): 契约检查与执行方式.
- [包管理器选择](../guide/scripts.md): 用户侧如何指定包管理器.
