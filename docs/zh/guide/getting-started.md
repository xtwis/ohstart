---
title: 快速开始
order: 1
---

# {{ $frontmatter.title }}

本页演示如何添加一个源, 并运行其中的第一个脚本. 全流程不到五分钟.

## 安装

ohstart 以全局命令的形式安装, 与所用包管理器无关:

```bash
# pnpm
pnpm add -g @xtwis/ohstart

# npm
npm install -g @xtwis/ohstart

# yarn
yarn global add @xtwis/ohstart
```

安装后提供两个可执行文件: `ohstart` 与短别名 `ohs`, 二者等价.

**环境要求.** Node 22 或更高版本, 以及 git 客户端, ohstart 通过 git 拉取源.

## 添加源

源是一个 git 仓库, 其中包含一组脚本. 将仓库地址交给 ohstart:

```bash
ohstart source add https://github.com/<org>/<repo>
```

该命令依次完成三件事:

1. 以 `git clone --depth 1` 将仓库拉取到临时目录.
2. 读取仓库根目录的 `ohstart.json`, 取其中的源名称作为本地键名.
3. 将源写入配置文件.

键名冲突时, ohstart 会要求另指定一个键名:

```
enter another key name for source templates? my-team
added source my-team (templates) -> https://github.com/<org>/<repo>
```

使用 `--key` 直接指定键名, 使用 `--note` 添加备注.

## 设置默认源

一个源可被设为默认源, 此后 `ohstart init <脚本名>` 均指向该源:

```bash
ohstart source default my-team
```

不带参数时, 该命令输出当前默认源:

```bash
ohstart source default
```

## 列出脚本

```bash
ohstart list
```

```
source my-team (templates)

add  sayhi       Sample add script: write hello.md in the working directory
init vite/react  Scaffold a React project
```

不带参数时读取**默认源**. 查看其他源时把键名作为参数:

```bash
ohstart list my-team
```

按类型过滤:

```bash
ohstart list --type init
ohstart list --add
```

## 运行脚本

初始化类脚本使用 `init`, 加装类脚本使用 `add`:

```bash
ohstart init vite/react
```

首次运行某个源的脚本时, ohstart 会请求确认该源的信任状态:

```
source my-team (templates) is not trusted: https://github.com/<org>/<repo>
sources from this source run arbitrary code, continue? [y/N]
```

确认后信任状态被记录, 后续不再询问. 脚本在**当前目录**中执行.

ohstart 的 flag 写在脚本名之前, 脚本的参数写在脚本名之后:

```bash
ohstart init --trust vite/react my-app --template react-ts
```

上例中 `--trust` 由 ohstart 处理, `my-app` 与 `--template react-ts` 交给 `vite/react` 脚本.

## 下一步

- [核心概念](./concepts.md): 源, 脚本与信任三者的关系.
- [管理源](./sources.md): 源命令组的完整用法.
- [运行脚本](./scripts.md): 参数传递与包管理器的选择.
