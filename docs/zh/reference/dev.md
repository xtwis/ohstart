---
title: ohsd 命令参考
order: 2
---

# {{ $frontmatter.title }}

`ohsd` 是源作者侧命令, 来自 `@xtwis/ohstart-dev`, 二进制名为 `ohstart-dev`, 别名 `ohsd`. 本页按命令列出语法, 参数与输出.

## 命令总表

| 命令                               | 别名  | 作用                     |
| ---------------------------------- | ----- | ------------------------ |
| `ohsd init [目录]`                 | -     | 创建源骨架               |
| `ohsd new [目录] [名称]`           | -     | 在源中新增脚本骨架       |
| `ohsd check [脚本]`                | -     | 静态检查源与脚本契约     |
| `ohsd run <类型> <脚本> [参数...]` | -     | 在本地工作目录中试跑脚本 |
| `ohsd version`                     | `ver` | 输出版本号               |
| `ohsd help`                        | -     | 输出用法                 |

不带子命令时执行 `help`.

`new` / `run` / `check` 以源根为前提: 命令从当前目录向上找到 git 仓库根, 并要求根目录存在 `ohstart.json`. `init` 不受此限制.

## init

```
ohsd init [目录] [--name <名称>] [--author <作者>] [--description <描述>] [--bare]
```

创建源骨架, 目录省略时为当前目录.

| 参数或 flag     | 必需 | 说明                                  |
| --------------- | ---- | ------------------------------------- |
| `目录`          | 否   | 目标目录, 省略时为当前目录            |
| `--name`        | 否   | 源名, 省略时取目录名                  |
| `--author`      | 否   | 作者, 省略时取 `git config user.name` |
| `--description` | 否   | 源描述, 省略时为空字符串              |
| `--bare`        | 否   | 不生成示例脚本                        |

目标目录须为空. 以下条目视为可忽略而不算作占用: `.git`, `.gitignore`, `.DS_Store`, `README*`, `LICENSE*`.

产出:

| 文件            | 内容                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| `ohstart.json`  | 源清单, 登记示例脚本                                                    |
| `package.json`  | `type: module`, 依赖 `@xtwis/ohstart-dev` 与 `typescript`               |
| `tsconfig.json` | 配合 `pnpm check` 做类型检查                                            |
| `.gitignore`    | 追加 `# ohstart` 标题与 `.ohstart`, `.ohstart-run.mjs`, `node_modules/` |
| `sayhi/`        | 示例 `add` 脚本, 写入 `hello.md`, `--bare` 时不生成                     |

成功时输出:

```
ohsd init
┌  create a new source skeleton (ohstart.json + project config + sample script)
│
◇  created source my-templates with sample script in /path/to/my-templates
│
◇  not a git repository yet: run `git init` before publishing this source
│
◇  next: pnpm install | pnpm check | ohsd new <dir> --type add | ohsd check
│
●
```

无 git 仓库时提示先执行 `git init`.

## new

```
ohsd new [目录] [名称] [--type <init|add>] [--description <描述>]
```

在已有源中新增一个脚本骨架, 并登记到 `ohstart.json`.

| 参数或 flag     | 必需 | 说明                               |
| --------------- | ---- | ---------------------------------- |
| `目录`          | 否   | 脚本目录, 省略时为当前目录         |
| `名称`          | 否   | 脚本名, 省略时取目录相对源根的路径 |
| `--type`        | 否   | `init` 或 `add`, 省略时交互式选择  |
| `--description` | 否   | 脚本描述, 省略时为空字符串         |

省略 `--type` 时需要在交互式终端中选择, 非交互环境须显式给出.

目录相对源根的路径即脚本路径. 约束:

- 路径须位于源根之内, 且不能是源根本身.
- 路径的每一段不得以 `.` 开头.
- 名称不得包含空白, 反斜杠与冒号, 不得以 `/` 开头, 不得含 `.` 或 `..` 段.
- 名称与路径均不得与已登记项重复.
- 目录须为空.

产出 `script.json`, `argv.ts`, `index.ts` 三个文件, 输出:

```
ohsd new
┌  add a script skeleton to an existing source
│
◇  created script lint/eslint at lint/eslint
│
◇  next: ohsd check lint/eslint
│
●
```

## check

```
ohsd check [脚本]
```

只做静态检查, 不执行脚本代码.

| 参数   | 必需 | 说明                           |
| ------ | ---- | ------------------------------ |
| `脚本` | 否   | 只检查该脚本, 省略时检查整个源 |

检查项:

| 检查项        | 级别    | 条件                                           |
| ------------- | ------- | ---------------------------------------------- |
| 源根          | error   | 不在 git 仓库内, 或仓库根缺少 `ohstart.json`   |
| 路径重复      | error   | 两个脚本名指向同一路径                         |
| 脚本目录      | error   | 目录不存在, 或路径不是目录                     |
| `script.json` | error   | 非法 JSON, 字段缺失或类型不符                  |
| 名称一致      | error   | `script.json` 的 `name` 与登记的键不一致       |
| 入口文件      | error   | `entry` 指定的文件不存在                       |
| 参数文件      | error   | `argv` 指定的文件不存在                        |
| 未登记脚本    | warning | 目录含 `script.json` 但未登记到 `ohstart.json` |

指定脚本时跳过路径重复与未登记脚本两项检查.

无问题时输出:

```
ohsd check
┌  validate the source contract
│
◇  source my-templates at /path/to/my-templates (2 scripts registered)
│
◇  check passed
│
●
```

有问题时逐条输出, 末尾汇总:

```
ohsd check
┌  validate the source contract
│
◇  source my-templates at /path/to/my-templates (2 scripts registered)
│
◇  error  script directory does not exist: lint/eslint -> lint/eslint
│
◇  1 errors, 0 warnings
│
●
```

存在 error 时退出码为 `1`, 仅 warning 时为 `0`.

## run

```
ohsd run <类型> <脚本> [参数...]
```

在工作目录中执行脚本, 用于验证脚本的实际行为.

| 参数或 flag                   | 位置       | 说明                                    |
| ----------------------------- | ---------- | --------------------------------------- |
| `类型`                        | 必需       | `init` 或 `add`, 须与脚本登记的类型一致 |
| `脚本`                        | 必需       | 脚本名, 须与 `ohstart.json` 的键一致    |
| `参数...`                     | 可选       | 原样传给脚本                            |
| `--keep`                      | 脚本名之前 | 保留上次的工作目录内容                  |
| `--no-git`                    | 脚本名之前 | 跳过 `git init`, 写入最小仓库骨架       |
| `--npm` / `--pnpm` / `--yarn` | 脚本名之前 | 指定工作目录的包管理器                  |
| `--agent=<npm\|pnpm\|yarn>`   | 脚本名之前 | 同上, 取值形式                          |
| `--no-detect`                 | 脚本名之前 | 跳过包管理器探测                        |

上表所有 flag 都必须写在脚本名之前. 写在脚本名之后的同名 token 归脚本所有, `ohsd` 不做区分.

工作目录固定为源根下的 `.ohstart`:

- 每次执行前清空, `--keep` 时保留.
- 首次使用时会向源根 `.gitignore` 追加 `.ohstart` 与 `.ohstart-run.mjs`.
- 目录内初始化 git 仓库, 使脚本向上查找仓库根时停在此处而不命中源仓库. `--no-git` 时写入由 `HEAD` 与 `config` 组成的最小骨架.
- 目录内初始化包管理器项目. pnpm 使用 `pnpm init --bare --no-init-package-manager`, 并写入 `packages` 为空的 `pnpm-workspace.yaml`, 以免向上命中源仓库的 workspace. 初始化失败时回落到最小 `package.json`.

包管理器探测起点是工作目录, 因此会向上命中源仓库自身的 `package.json` 与锁文件. 探测不到或探测到不支持的包管理器时使用 pnpm, 并输出对应警告. 探测规则见 [包管理器](../guide/scripts.md).

调试输出:

```bash
OHSTART_DEBUG=1 ohsd run add sayhi
```

有 `OHSTART_DEBUG` 时输出工作目录路径与 `.gitignore` 的追加内容.

脚本以非零码退出时, `ohsd run` 的退出码与之相同.

## help

```bash
ohsd help
```

输出该命令的用法: 逐项列出位置参数, 选项与子命令及其说明.

所有命令均可接受 `--help` 查看说明:

```bash
ohsd run --help
```

## version

```bash
ohsd version
```

输出当前版本号.

## 下一步

- [ohstart 命令参考](./cli.md): 用户侧命令.
- [契约字段](./contracts.md): `ohstart.json` 与 `script.json` 的字段.
- [本地调试](../script/debug.md): 检查项与工作目录的使用场景.
