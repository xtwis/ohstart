---
title: 脚本契约
order: 2
---

# {{ $frontmatter.title }}

脚本的目录结构, 两份 JSON 的字段与参数定义方式共同构成脚本契约.

## 目录结构

脚本目录至少包含三个文件, 其余文件均视为资源:

```
lint/eslint/
  script.json     # 必需: 脚本元信息
  index.ts        # 必需: 入口代码, 默认入口
  argv.ts         # 必需: 参数定义, 默认参数文件
  templates/      # 可选: 资源文件, 随源一并克隆
```

ohstart 克隆整个源, 因此资源文件放在脚本目录内, 脚本按相对路径读取即可.

## script.json

该文件描述脚本自身, 其字段决定脚本如何被识别与调用:

```json
{
  "name": "lint/eslint",
  "type": "add",
  "description": "安装一套 eslint 配置",
  "entry": "index.ts",
  "argv": "argv.ts"
}
```

| 字段          | 必需 | 说明                                                      |
| ------------- | ---- | --------------------------------------------------------- |
| `name`        | 是   | 脚本名, 须与 `ohstart.json` 中登记的键一致, 不一致时报错. |
| `type`        | 是   | `init` 或 `add`, 决定使用哪个命令执行.                    |
| `description` | 是   | 一句话说明, `ohstart list` 会显示.                        |
| `entry`       | 否   | 入口文件, 默认 `index.ts`. 文件本身必需存在.              |
| `argv`        | 否   | 参数定义文件, 默认 `argv.ts`. 文件本身必需存在.           |

`name` 与**路径**是两回事: 名称可用 `/` 分级, 路径也可与名称不同, `ohstart.json` 的 `scripts` 负责将名称指向路径.

## index.ts

入口文件在打包后被执行, 只接受一种导出形式:

```ts
export default async function main() {
  // ...
}
```

导出内容不是函数时报错 `script entry must default-export a function`.

脚本在**用户的当前目录**中执行, 而非源目录. 源内的相对路径需通过 `import.meta.url` 一类方式定位, 不能依赖 `process.cwd()`.

## argv.ts

参数定义文件描述脚本可接收的参数, 须默认导出 `defineArgv(...)` 的返回值:

```ts
import { defineArgv } from "@xtwis/ohstart-dev"

export default defineArgv({
  args: [
    { name: "name", description: "Name to greet" },
    { name: "target", required: true, description: "Where to write" },
  ],
  flags: {
    path: { type: "string", description: "Directory to create hello.md in" },
    force: { type: "boolean", description: "Overwrite existing files" },
  },
})
```

直接导出裸 schema 不被接受, 会报错提示 `a bare schema, which is not supported`.

### 位置参数 args

位置参数按出现顺序赋值, 用于必需的输入项.

| 字段          | 说明                                                        |
| ------------- | ----------------------------------------------------------- |
| `name`        | 参数名, 必填                                                |
| `description` | 提示语, 必填. 缺少该参数时以此文案提示用户.                 |
| `required`    | 是否必填. 缺少时在交互式终端中提示补全, 非交互环境直接报错. |

位置参数按顺序对应命令行中的位置值.

### flag

flag 以 `--` 前缀传入, 分为开关与带值两种.

| 字段          | 说明                        |
| ------------- | --------------------------- |
| `type`        | `string` 或 `boolean`, 必填 |
| `description` | 说明文字, 必填              |

flag 以 `--名称` 或 `--名称 值` 传入. `boolean` 类型的 flag 写成 `--force` 即为 `true`.

### 读取参数

脚本通过 `getArgv()` 读取解析结果, 无需自行处理环境变量:

```ts
import argv from "./argv.js"

const { getArgv } = argv

export default async function main() {
  const { args, flags } = getArgv()
  const name = args[0] ?? "world"
  const dir = flags.path ?? process.cwd()
  const force = flags.force === true
}
```

`getArgv()` 返回:

```ts
interface ScriptArgv {
  args: string[]
  flags: { [name: string]: string | boolean }
}
```

值来自 ohstart 传给脚本的环境变量 `OHSTART_ARGV`, 内容为 JSON.

flag 名称按 `argv.ts` 中的写法原样传入, ohstart 不做命名转换.

## ohstart.json

源根的清单文件, 决定哪些脚本可被 ohstart 识别:

```json
{
  "name": "my-templates",
  "author": "your-name",
  "description": "团队模板",
  "scripts": {
    "sayhi": "sayhi",
    "lint/eslint": "lint/eslint"
  }
}
```

`scripts` 的取值规则:

- 必须是字符串, 指向源内的一个目录.
- 路径不能超出源目录.
- 同一个路径不能对应两个脚本名.

字段级规格见 [契约规格](../reference/contracts.md).

## 下一步

- [SDK 参考](./sdk.md): 脚本中可用的 `log` / `prompt` / `agent`.
- [本地调试](./debug.md): 契约检查与执行方式.
- [契约规格](../reference/contracts.md): 字段级细节.
