---
title: 本地调试
order: 4
---

# {{ $frontmatter.title }}

两个命令分别覆盖静态检查与实际执行, 按需交替使用.

## 契约检查

`ohsd check` 负责静态检查源与脚本的契约, 不执行任何代码:

```bash
ohsd check
```

检查项如下:

| 检查项        | 级别    | 说明                                              |
| ------------- | ------- | ------------------------------------------------- |
| 源根          | error   | 须位于 git 仓库内, 且仓库根存在 `ohstart.json`    |
| 路径重复      | error   | 两个脚本名指向同一目录                            |
| 脚本目录      | error   | 目录不存在, 或指向的不是目录                      |
| `script.json` | error   | JSON 格式, 必需字段, `type` 是否为 init / add     |
| 名称一致      | error   | `script.json` 的 `name` 与登记的键不一致          |
| 入口文件      | error   | `index.ts` 或 `entry` 指定的文件不存在            |
| 参数文件      | error   | `argv.ts` 或 `argv` 指定的文件不存在              |
| 未登记的脚本  | warning | 目录中存在 `script.json`, 但未写入 `ohstart.json` |

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

存在问题时逐条输出, 末尾给出汇总, 例如:

```
│
◇  source my-templates at /path/to/my-templates (2 scripts registered)
│
◇  error  script directory does not exist: lint/eslint -> lint/eslint
│
◇  1 errors, 0 warnings
│
●
```

仅检查一个脚本:

```bash
ohsd check lint/eslint
```

存在 error 时退出码为 1, 仅有 warning 时退出码为 0.

## 执行脚本

`ohsd run` 负责按用户侧的流程执行脚本, 工作目录与源仓库分离:

```bash
ohsd run add sayhi
```

`ohsd run` 依次完成:

1. 在**源根下**创建 `.ohstart` 作为工作目录.
2. 在该目录内初始化一个最小项目 (`package.json`) 与一个 git 仓库.
3. 打包脚本并在该工作目录中执行.

脚本通常需要安装依赖, 创建文件, 依赖 git 仓库. 直接在源仓库中执行会污染源, 因此改在 `.ohstart` 中执行.

相关 flag:

| flag                          | 作用                                         |
| ----------------------------- | -------------------------------------------- |
| `--keep`                      | 保留上一次的工作目录, 不先清空               |
| `--no-git`                    | 不调用 git, 工作目录内直接写入最小的仓库骨架 |
| `--npm` / `--pnpm` / `--yarn` | 指定工作目录使用的包管理器                   |
| `--agent=<名>`                | 同上一行, 以赋值形式指定                     |
| `--no-detect`                 | 跳过探测, 与 `--agent` 同用时直接使用指定值  |

工作目录内的项目按包管理器初始化. 指定或探测到 pnpm 时, 还会写入一份 `packages` 为空的 `pnpm-workspace.yaml`, 以免 pnpm 向上将源仓库当作 workspace 根; 初始化失败时回落到最小的 `package.json`. 未指定且探测不到时, 默认使用 pnpm.

`--no-git` 适用于没有 git 的环境: 跳过 `git init`, 直接写入由 `HEAD` 与 `config` 组成的最小仓库骨架. 脚本向上查找 git 仓库根时, 会停在 `.ohstart` 而不会命中源仓库.

工作目录为 `.ohstart`, 已写入 `.gitignore`, 不会被误提交.

### 传递参数

写法与用户侧一致, 参数直接跟在脚本名之后:

```bash
ohsd run add sayhi my-name --path ./out
```

## 调试

主要通过日志输出与退出码定位问题.

- 在脚本中加入 `log.debug(...)`, 以 `OHSTART_DEBUG=1 ohsd run add sayhi` 执行以输出中间状态.
- 查看脚本的元数据与用法: `ohstart view <脚本>`.
- 脚本执行失败时退出码会传回, `ohsd run` 的退出码同样非 0.

## 下一步

- [脚本契约](./contract.md): 契约细节.
- [SDK 参考](./sdk.md): 脚本中可用的能力.
