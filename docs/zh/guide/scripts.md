---
title: 运行脚本
order: 4
---

# {{ $frontmatter.title }}

本页说明脚本如何执行, 以及参数如何传递.

## 两种命令

```bash
ohstart init <脚本> [参数...]    # 初始化类脚本
ohstart add <脚本> [参数...]     # 加装类脚本
```

命令与脚本类型必须一致. 脚本为 `init` 类型而使用 `ohstart add` 执行时会报错, 并提示应使用的命令.

脚本地址有两种写法:

```bash
ohstart init vite/react              # 默认源
ohstart init @my-team/vite/react     # 指定源
```

## 传递参数

脚本名之后的参数全部交给脚本, ohstart 不再解析:

```bash
ohstart init vite/react my-app --template react-ts
```

- `my-app` 为脚本的**位置参数**.
- `--template react-ts` 为脚本的 **flag**.

ohstart 自身保留以下 flag: `--trust` (单次放行信任确认), `--npm` / `--pnpm` / `--yarn`, `--agent=<名>`, `--no-detect` (包管理器选择). 这些必须写在脚本名**之前**:

```bash
ohstart init --pnpm vite/react
```

写在脚本名之后的参数归脚本所有, 即使与上述名称相同, 也不会被 ohstart 解析.

## 必填参数

脚本可在 `argv.ts` 中声明必填位置参数. 未提供时 ohstart 会提示补全, 提示文案取自该参数的 `description`:

```
Name to greet
```

非交互环境下不提示, 直接报错 `missing required arg: <名字>`.

## 包管理器

脚本安装依赖时需要包管理器. ohstart 从当前目录向上查找, 直到 home 目录:

1. 读取 `package.json` 的 `packageManager` 字段, 或 `devEngines.packageManager`.
2. 未声明时查找锁文件: `pnpm-lock.yaml` 对应 pnpm, `package-lock.json` / `npm-shrinkwrap.json` 对应 npm, `yarn.lock` 对应 yarn.
3. `bun.lockb` / `bun.lock` / `deno.lock` 视为不支持, 需显式指定.
4. 探测不到, 或同时存在多个包管理器的锁文件, 都会要求显式指定.

显式指定:

```bash
ohstart init --pnpm vite/react                    # 直接指定
ohstart add --agent=yarn lint/eslint
ohstart init --no-detect --agent=pnpm vite/react  # 跳过探测, 使用指定值
```

`--no-detect` 单独使用时不探测也不指定, 脚本拿不到包管理器; 需要显式声明时与 `--agent` 同用.

## 工作目录

脚本在命令执行时的当前目录中运行. 需要向某个项目写入内容时, 先切换到该项目目录再执行.

## 下一步

- [脚本契约](../script/contract.md): 修改或编写脚本时的契约要求.
- [SDK 参考](../script/sdk.md): 脚本中可用的能力.
