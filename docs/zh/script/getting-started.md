---
title: 快速开始
order: 1
---

# {{ $frontmatter.title }}

本页从一个空目录开始, 依次创建源, 添加脚本并在本地执行. 所用命令为 `ohsd`, 来自 `@xtwis/ohstart-dev`.

## 安装

`ohsd` 作为源的开发依赖安装:

```bash
pnpm add -D @xtwis/ohstart-dev
```

## 创建源

选一个空目录, 由 `ohsd init` 生成源骨架:

```bash
mkdir my-templates && cd my-templates
ohsd init
```

`ohsd init` 生成的骨架:

```
my-templates/
  ohstart.json      # 源清单
  package.json      # 项目配置
  tsconfig.json     # TypeScript 配置
  .gitignore        # 追加 ohstart 相关忽略项
  sayhi/            # 示例脚本, 加 --bare 时不生成
    script.json
    argv.ts
    index.ts
```

约束与默认值:

- 目录须基本为空, 仅允许已存在 `.git`, `.gitignore`, `.DS_Store`, `README*`, `LICENSE*`.
- 源名默认取目录名, 作者默认取 `git config user.name`, 均可用 `--name`, `--author`, `--description` 覆盖.
- `--bare` 不生成示例脚本.
- 目录中没有 `.git` 时会给出警告, 不影响使用.

`ohstart.json` 的内容:

```json
{
  "name": "my-templates",
  "author": "your-name",
  "description": "",
  "scripts": {
    "sayhi": "sayhi"
  }
}
```

`scripts` 将脚本名映射到目录路径.

## 添加脚本

脚本是源内的一个目录, `ohsd new` 负责创建并登记:

```bash
ohsd new lint/eslint --type add --description "安装一套 eslint 配置"
```

生成:

```
lint/eslint/
  script.json
  argv.ts
  index.ts
```

同时将 `"lint/eslint": "lint/eslint"` 写入 `ohstart.json`.

约束:

- 脚本目录须位于源内, 且不能是源根目录.
- 路径不能以 `.` 开头, 不能包含空格.
- 目标目录已存在且非空时报错.
- 脚本名默认取相对源根的路径, 可用第二个位置参数指定.
- 省略 `--type` 时提示选择 `init` 或 `add`.

## 编写脚本

脚本由入口文件与参数定义组成, 二者共同构成执行契约.

入口为 `index.ts`, 必须默认导出一个函数:

```ts
import { log } from "@xtwis/ohstart-dev"

export default async function main() {
  log.info("hello from ohstart script")
}
```

参数定义写在 `argv.ts`:

```ts
import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({
  args: [{ name: "name", description: "Name to greet" }],
  flags: { path: { type: "string", description: "Directory to write hello.md in" } },
})
```

脚本中读取参数:

```ts
import argv from "./argv.js"

const { getArgv } = argv

export default async function main() {
  const { args, flags } = getArgv()
  log.info(`hello ${args[0] ?? "world"}`)
}
```

## 本地运行

`ohsd run` 在独立的工作目录中执行脚本, 不触碰源仓库:

```bash
ohsd run add sayhi
```

工作目录为源根下的 `.ohstart`, 每次执行前清空, 加 `--keep` 可保留.

执行前先确认契约:

```bash
ohsd check
```

## 下一步

- [脚本契约](./contract.md): 脚本目录中各文件的作用与参数定义方式.
- [SDK 参考](./sdk.md): 脚本中可用的 `log` / `prompt` / `agent`.
- [本地调试](./debug.md): `check` 与 `run` 的细节.
