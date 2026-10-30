---
title: 错误对照
order: 6
---

# {{ $frontmatter.title }}

本页把报错文案对应到原因与处理办法. 文案中的 `<...>` 为占位内容.

命令报错时文案写入 stderr, 退出码为 `1`; warning 只提示, 不影响退出码.

## 契约

| 文案                                                                 | 原因                                             | 处理                                 |
| -------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------ |
| `ohstart.json: is not valid JSON`                                    | 文件不是合法 JSON                                | 修正 JSON 语法                       |
| `ohstart.json: must be a JSON object`                                | 根节点不是对象                                   | 改为对象                             |
| `ohstart.json: name is required`                                     | `name` 缺失或为空                                | 填写源名                             |
| `ohstart.json: "scripts" must be an object`                          | `scripts` 缺失或不是对象                         | 改为对象                             |
| `ohstart.json: script name must not be empty`                        | `scripts` 存在空字符串键                         | 为脚本补名称                         |
| `ohstart.json: scripts["<键>"] must be a string`                     | 映射值不是字符串                                 | 改为相对源根的路径                   |
| `ohstart.json: "<字段>" must be a string`                            | `name` / `author` / `description` 缺失或类型不符 | 补齐字符串字段                       |
| `script.json in <路径>: is not valid JSON`                           | 脚本元信息不是合法 JSON                          | 修正 JSON 语法                       |
| `script.json in <路径>: name is required`                            | `name` 缺失或为空                                | 填写脚本名                           |
| `script.json in <路径>: "type" must be one of init, add, got "<值>"` | `type` 取值非法                                  | 改为 `init` 或 `add`                 |
| `script.json in <路径>: "<字段>" must be a string`                   | 必需字段缺失或类型不符                           | 补齐 `name` / `type` / `description` |

## 脚本

| 文案                                                             | 原因                                 | 处理                                 |
| ---------------------------------------------------------------- | ------------------------------------ | ------------------------------------ |
| `unknown script: <名称> in source <键名>`                        | `ohstart.json` 未登记该名称          | 检查名称, 或登记脚本                 |
| `script.json name mismatch: <实际> != <期望>`                    | `script.json` 的 `name` 与键不一致   | 二者改为一致                         |
| ``wrong script type: <名称> is <类型>, use `ohstart <类型>` ``   | 命令与脚本类型不符                   | 换用对应命令                         |
| `missing argv.ts: <名称>`                                        | 参数定义文件不存在                   | 创建 `argv.ts` 或修正 `argv` 字段    |
| ``<文件> must `export default defineArgv({ ... })`, got <实际>`` | 参数文件未导出 `defineArgv` 的返回值 | 改为默认导出 `defineArgv(...)`       |
| `<文件> does not export an argv schema`                          | 导出结果缺少 `schema`                | 同上                                 |
| `missing required arg: <名称>`                                   | 非交互环境下缺少必填位置参数         | 补齐参数                             |
| `script entry must default-export a function`                    | 入口文件未默认导出函数               | 改为 `export default async function` |
| `failed to bundle <入口>: <原因>`                                | 打包入口时出错, 常见于语法或导入错误 | 按原因修正代码                       |

## 源

| 文案                                                            | 原因                           | 处理                                    |
| --------------------------------------------------------------- | ------------------------------ | --------------------------------------- |
| `unknown source: <键名>`                                        | 配置中不存在该键名             | 用 `ohstart source list` 核对, 或添加源 |
| `source <键名> already exists`                                  | 键名已被占用                   | 换键名                                  |
| `a new key name is required`                                    | `source rename` 未给新键名     | 补上新键名                              |
| `the new key name is the same as <键名>`                        | 新旧键名相同                   | 换键名                                  |
| ``no default source: run `ohstart source default <key>` first`` | 未设置默认源, 而地址未带源前缀 | 设置默认源, 或改用 `@<键名>/<名称>`     |
| `default source is not configured: <键名>`                      | 默认源指向的键名已不存在       | 重新设置默认源                          |
| `invalid address: <地址>, expected @<key>/<script>`             | `@` 开头但格式不完整           | 改为 `@<键名>/<脚本>`                   |
| `failed to clone <url>`                                         | 克隆失败, 后附 git 的 stderr   | 检查地址与访问权限                      |
| `source is not trusted: <键名>, pass --trust to allow this run` | 非交互环境且源未信任           | 先 `source trust`, 或加 `--trust`       |
| `aborted: source is not trusted: <键名>`                        | 交互确认时拒绝                 | 确认后重试, 或信任该源                  |

## 项目

| 文案                                                                                      | 原因                                 | 处理                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| `not inside a git repository: <目录>`                                                     | 当前目录不在 git 仓库内              | 先 `git init`                  |
| ``no ohstart.json at the git root: <根目录>, run `ohsd init` first``                      | 仓库根缺少 `ohstart.json`            | 执行 `ohsd init`, 或确认仓库根 |
| `<根目录> is not empty`                                                                   | 目标目录已有内容                     | 换空目录, 或清理后重试         |
| `path exists and is not a directory: <路径>`                                              | 同名路径不是目录                     | 换路径                         |
| `<根目录> is the source root, create the script in a subdirectory: ohsd new <dir> <name>` | 在源根直接建脚本                     | 指定子目录                     |
| `path is not inside the source: <路径>`                                                   | 路径越出源根                         | 改为源根内的路径               |
| `script already exists: <名称>`                                                           | 名称已登记                           | 换名称                         |
| `script path is already used: <路径> (owner: <名称>)`                                     | 路径已被其他脚本占用                 | 换目录                         |
| `script directory is not empty: <路径>`                                                   | 脚本目录非空                         | 清理目录, 或换目录             |
| `script directory does not exist: <键名> -> <路径>`                                       | 登记的路径不存在                     | 创建目录, 或修正登记           |
| `script path is not a directory: <键名> -> <路径>`                                        | 登记的路径不是目录                   | 改为目录路径                   |
| `script entry does not exist: <键名> -> <入口>`                                           | 入口文件不存在                       | 创建 `index.ts` 或修正 `entry` |
| `script argv.ts does not exist: <键名> -> <路径>`                                         | 参数文件不存在                       | 创建 `argv.ts` 或修正 `argv`   |
| `script is not registered in ohstart.json: <键名>`                                        | 指定的脚本未登记                     | 登记脚本, 或换名称             |
| `invalid script name: <名称>`                                                             | 名称含空白, 反斜杠, 冒号或非法路径段 | 改为合法名称                   |
| `script directory must not start with a dot: <路径>`                                      | 路径含以 `.` 开头的段                | 换目录                         |

## 命令与包管理器

| 文案                                                                           | 原因                                 | 处理                               |
| ------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------- |
| `invalid script type: <值>, expected init or add`                              | `list` 的类型过滤或 `run` 的类型非法 | 取 `init` 或 `add`                 |
| `unexpected arguments: <参数>`                                                 | `source add` 传入多余位置参数        | 去掉多余参数                       |
| `no package manager specified`                                                 | 脚本拿到空包管理器却调用了 `agent`   | 指定 `--npm` / `--pnpm` / `--yarn` |
| `invalid package manager: <值>, expected npm, pnpm, or yarn`                   | `--agent=` 取值非法                  | 取三种之一                         |
| `option --agent requires a value: use --agent=<npm\|pnpm\|yarn>`               | `--agent` 未带值                     | 改为 `--agent=<名>`                |
| `only one package manager can be specified: <flag 列表>`                       | 同时指定多个包管理器 flag            | 只保留一个                         |
| `cannot detect the package manager in <目录>`                                  | 探测不到包管理器, 且未指定           | 指定包管理器, 或加 `--no-detect`   |
| `detected an unsupported package manager: <名称>, expected npm, pnpm, or yarn` | 命中 bun / deno 锁文件               | 显式指定包管理器                   |
| `multiple lock files found: <文件列表>`                                        | 同类锁文件多于一个                   | 清理锁文件, 或显式指定             |
| `cannot confirm the package manager without a tty`                             | 探测结果与指定值不同且无法交互确认   | 加 `--no-detect`                   |
| `aborted: package manager was not confirmed`                                   | 交互确认时拒绝                       | 确认后重试                         |
| `<命令> failed with exit code <码>`                                            | `agent` 执行的命令以非零码退出       | 按终端输出排查                     |
| `failed to run <命令>: <原因>`                                                 | `agent` 无法启动命令                 | 确认包管理器已安装                 |

## 运行时

| 文案                                                           | 原因                     | 处理               |
| -------------------------------------------------------------- | ------------------------ | ------------------ |
| `interactive prompt requires a tty`                            | 非交互环境调用按键式交互 | 改用非交互路径     |
| `no option to select from`                                     | 选择项为空数组           | 修正脚本           |
| `stdin closed`                                                 | 标准输入已关闭           | 在交互式终端中重试 |
| `cannot create the working directory .ohstart inside <根目录>` | 工作目录无法定位         | 确认源根可写       |
| `refusing to clear: <目录> is a symbolic link`                 | 工作目录是符号链接       | 删除该链接         |
| `refusing to clear: <目录> is not a directory`                 | 工作目录同名路径不是目录 | 删除该路径         |

## warning

| 文案                                                                                | 触发                                |
| ----------------------------------------------------------------------------------- | ----------------------------------- |
| ``not a git repository yet: run `git init` before publishing this source``          | `ohsd init` 后目录尚未成为 git 仓库 |
| `skipping <名称>: <原因>`                                                           | `ohstart list` 跳过损坏的脚本       |
| `orphan <目录> has a script.json but is not registered in ohstart.json`             | `ohsd check` 发现未登记的脚本目录   |
| `git init failed in <目录>, falling back to a minimal git skeleton`                 | `ohsd run` 调用 git 失败            |
| `package manager init failed in <目录>, falling back to a minimal package manifest` | 工作目录内包管理器初始化失败        |
| `detected an unsupported package manager: <名称>, using <指定>`                     | 探测到不支持的包管理器, 改用指定值  |
| `multiple lock files found: <文件>, using <指定>`                                   | 锁文件冲突, 改用指定值              |

## 下一步

- [ohstart 命令参考](./cli.md): 命令与 flag.
- [ohsd 命令参考](./dev.md): 检查项与工作目录.
- [契约字段](./contracts.md): 字段级约束.
