---
title: 环境变量
order: 5
---

# {{ $frontmatter.title }}

ohstart 通过三个环境变量向脚本传值, 并控制调试输出.

| 变量            | 设置者                 | 作用                        |
| --------------- | ---------------------- | --------------------------- |
| `OHSTART_ARGV`  | `ohstart` / `ohsd run` | 传给脚本的参数, JSON 字符串 |
| `OHSTART_AGENT` | `ohstart` / `ohsd run` | 传给脚本的包管理器标识      |
| `OHSTART_DEBUG` | 使用者                 | 任意非空值开启调试日志      |

## OHSTART_ARGV

执行脚本时由 ohstart 写入, 内容为参数解析结果的 JSON:

```json
{
  "args": ["my-app"],
  "flags": { "template": "react-ts", "force": true }
}
```

| 字段    | 类型                                | 说明                 |
| ------- | ----------------------------------- | -------------------- |
| `args`  | `string[]`                          | 位置参数, 按出现顺序 |
| `flags` | `Record<string, string \| boolean>` | flag 名称到值的映射  |

脚本侧通常不直接读该变量, 而是通过 `argv.ts` 的 `getArgv()` 取值:

```ts
import argv from "./argv.js"

const { getArgv } = argv
const { args, flags } = getArgv()
```

变量缺失或 JSON 非法时, `getArgv()` 返回空结果 `{ args: [], flags: {} }`. 变量内容由 ohstart 生成, 正常执行时不需要手动设置.

## OHSTART_AGENT

执行脚本时由 ohstart 写入, 内容为包管理器标识:

| 形式        | 示例           |
| ----------- | -------------- |
| `名称`      | `pnpm`         |
| `名称@版本` | `pnpm@11.24.0` |

版本来自探测到的 `package.json` 的 `packageManager` 字段, 未探测到时不含版本.

脚本通过 SDK 的 `agent` 读取该值:

```ts
import { agent } from "@xtwis/ohstart-dev"

if (agent.name) {
  await agent.install()
}
```

未写入该变量时 `agent.name` 与 `agent.version` 为 `undefined`, 调用 `install` / `add` 等方法抛出 `no package manager specified`. 以 `--no-detect` 执行且未指定包管理器时即属此情况.

## OHSTART_DEBUG

任意非空值都开启调试日志, 内容写入 stderr:

```bash
OHSTART_DEBUG=1 ohstart init vite/react
```

开启后额外输出调试信息: `ohsd init` 时包含 `.gitignore` 的追加内容, `ohsd run` 时包含工作目录路径. 脚本内的 `log.debug(...)` 也据此决定是否输出.

## 下一步

- [SDK 参考](../script/sdk.md): 脚本侧如何读取这些值.
- [本地调试](../script/debug.md): 调试流程.
- [包管理器](../guide/scripts.md): 探测与指定规则.
