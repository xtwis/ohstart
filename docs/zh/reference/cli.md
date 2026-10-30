---
title: ohstart 命令参考
order: 1
---

# {{ $frontmatter.title }}

`ohstart` 是用户侧命令, 二进制名为 `ohstart`, 别名 `ohs`. 本页按命令列出语法, 参数与输出.

## 命令总表

| 命令                            | 别名  | 作用               |
| ------------------------------- | ----- | ------------------ |
| `ohstart init <脚本> [参数...]` | -     | 执行 `init` 类脚本 |
| `ohstart add <脚本> [参数...]`  | -     | 执行 `add` 类脚本  |
| `ohstart list [源]`             | `ls`  | 列出源中的脚本     |
| `ohstart view <脚本>`           | -     | 展示脚本元信息     |
| `ohstart source <子命令>`       | `src` | 管理源             |
| `ohstart version`               | `ver` | 输出版本号         |
| `ohstart help`                  | -     | 输出用法           |

不带子命令时执行 `help`.

## init / add

```
ohstart init <脚本> [参数...]
ohstart add <脚本> [参数...]
```

两个命令只在脚本类型上不同: `init` 对应 `init` 类脚本, `add` 对应 `add` 类脚本, 类型不符时报错并提示应使用的命令.

`<脚本>` 支持两种地址写法:

| 写法             | 解析                               |
| ---------------- | ---------------------------------- |
| `名称`           | 在默认源中查找                     |
| `@<键名>/<名称>` | 在指定键名的源中查找, 名称可含 `/` |

脚本名之后的参数全部交给脚本, `ohstart` 不再解析. 以下 flag 由 `ohstart` 自身消费:

| flag                          | 位置       | 作用                             |
| ----------------------------- | ---------- | -------------------------------- |
| `--trust`                     | 脚本名之前 | 本次执行跳过信任确认, 不写入配置 |
| `--npm` / `--pnpm` / `--yarn` | 脚本名之前 | 指定包管理器                     |
| `--agent=<npm\|pnpm\|yarn>`   | 脚本名之前 | 同上, 取值形式                   |
| `--no-detect`                 | 脚本名之前 | 跳过包管理器探测                 |

上表所有 flag 都必须写在脚本名之前. 写在脚本名之后的同名 token 归脚本所有, `ohstart` 不做区分.

源未信任且当前不是交互式终端时, 执行会失败而不是提示确认. 信任模型见 [管理源](../guide/sources.md).

脚本执行失败时, 脚本的退出码原样成为 `ohstart` 的退出码.

## list

```
ohstart list [源] [--type <init|add>] [--init | --add]
```

`源` 为配置中的键名, 省略时读取默认源. 键名不存在时报错 `unknown source: <键名>`.

| 参数或 flag | 必需 | 说明                                   |
| ----------- | ---- | -------------------------------------- |
| `源`        | 否   | 源键名, 省略时为默认源                 |
| `--type`    | 否   | 取 `init` 或 `add`, 省略时列出全部脚本 |
| `--init`    | 否   | 等价于 `--type init`                   |
| `--add`     | 否   | 等价于 `--type add`                    |

`--type`、`--init`、`--add` 只能给一个, 同时给出时报错 `only one script type can be specified: <flag 列表>`.

先输出读到的源 `source: <键名> (<源名>)`, 再逐行输出脚本类型, 名称与描述, 名称按字母序排列:

```
ohstart list
┌  list available scripts by init / add type
│
◇  source: my-team (templates)
│
◇  add     lint/eslint    install an eslint config
│  init    vite/react     create a React project
│
●
```

脚本目录损坏时不中断列表, 单独占一行后继续:

```
│  skipping broken/script: script.json in broken/script: is not valid JSON
```

无匹配脚本时内容为 `no script in source <源名>`.

## view

```
ohstart view <脚本>
```

输出脚本的七项元信息, 其中 `usage` 由参数定义生成:

```
ohstart view
┌  show the full metadata of a script
│
◇  name           lint/eslint
│  type           add
│  description    install an eslint config
│  path           lint/eslint
│  entry          index.ts
│  argv           argv.ts
│  usage          ohstart add lint/eslint [--fix]
│
●
```

`usage` 恒以 `ohstart <类型> <名称>` 开头, 位置参数写成 `<名称>`, 非必填位置参数与 flag 外加方括号, 前置的 `@<键名>/` 不体现在其中.

## source

`source` 管理本地已配置的源, 子命令如下:

| 子命令                                  | 别名        | 作用             |
| --------------------------------------- | ----------- | ---------------- |
| `ohstart source add <url>`              | -           | 添加源           |
| `ohstart source list`                   | `ls`        | 列出已配置的源   |
| `ohstart source view <键名>`            | -           | 查看源详情       |
| `ohstart source default [键名]`         | `def`       | 查看或设置默认源 |
| `ohstart source rename <键名> <新键名>` | `ren`, `mv` | 重命名源         |
| `ohstart source remove <键名>`          | `rm`        | 删除源           |
| `ohstart source trust <键名>`           | -           | 标记为可信       |
| `ohstart source untrust <键名>`         | -           | 撤销信任         |

### add

```
ohstart source add <url> [--key <键名>] [--note <文本>] [--trust]
```

| 参数或 flag | 必需 | 说明                                            |
| ----------- | ---- | ----------------------------------------------- |
| `url`       | 是   | 源的 git 地址                                   |
| `--key`     | 否   | 本地键名, 省略时取源内 `ohstart.json` 的 `name` |
| `--note`    | 否   | 本地备注                                        |
| `--trust`   | 否   | 添加时即标记为可信                              |

添加时克隆源并读取 `ohstart.json` 取源名. 键名已被占用时交互式要求换一个:

```
enter another key name for source <键名>?
```

成功时输出:

```
ohstart source add
┌  add a source
│
◇  added source demo (templates) -> https://github.com/<org>/<repo>
│
●
```

### list

```
ohstart source list
```

每行依次为默认源标记, 键名, 源名与地址. 默认源以 `*` 标出, 可信源追加 `(trusted)`:

```
ohstart source list
┌  list configured sources
│
◇  *    my-team (trusted)    templates    https://github.com/<org>/<repo>
│       personal             mine         https://example.com/mine.git
│
●
```

无源时输出 `no source configured`.

### view

```
ohstart source view <键名>
```

输出六项:

```
ohstart source view
┌  show the details of a source
│
◇  key        my-team
│  name       templates
│  url        https://github.com/<org>/<repo>
│  trust      true
│  note       team templates
│  default    true
│
●
```

`note` 未设置时为空, `trust` 与 `default` 输出 `true` 或 `false`.

### default

```
ohstart source default [键名]
```

省略键名时输出配置中的默认源, 未设置则输出 `no default source`. 指定键名时校验其存在后写回配置, 输出 `default source is now <键名>`.

### rename

```
ohstart source rename <键名> <新键名>
```

新键名必填, 须与旧键名不同且未被占用. 原键名为默认源时, 默认源随之改为新键名. 成功输出 `renamed source <旧键名> to <新键名>`.

### remove

```
ohstart source remove <键名>
```

先确认:

```
remove source <键名>?
```

确认后删除, 原键名为默认源时一并清除默认源. 拒绝确认时输出 `cancelled`. 成功输出 `removed source <键名>`.

### trust / untrust

```
ohstart source trust <键名>
ohstart source untrust <键名>
```

分别输出 `source <键名> is now trusted` 与 `source <键名> is no longer trusted`.

## help

```bash
ohstart help
```

输出该命令的用法: 逐项列出位置参数, 选项与子命令及其说明.

所有命令均可接受 `--help` 查看说明:

```bash
ohstart source --help
```

## version

```bash
ohstart version
```

输出包名, 版本号, 以及打包日期:

```
ohstart version
┌  print the ohstart version
│
◇  @xtwis/ohstart
│
◇  v0.1.2  2026-10-31
│
●
```

## 退出码

| 情况             | 退出码                   |
| ---------------- | ------------------------ |
| 命令执行成功     | `0`                      |
| 命令报错         | `1`, 报错文案写入 stderr |
| 脚本以非零码退出 | 脚本的退出码             |

## 下一步

- [ohsd 命令参考](./dev.md): 源作者侧命令.
- [契约字段](./contracts.md): `ohstart.json` 与 `script.json` 的字段.
- [管理源](../guide/sources.md): 源的增删改与信任.
