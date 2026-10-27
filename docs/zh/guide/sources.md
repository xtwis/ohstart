---
title: 管理源
order: 3
---

# {{ $frontmatter.title }}

源命令组负责源的新增, 查看, 删除, 默认源设置与信任管理.

## 命令一览

| 命令                                    | 别名                                 | 作用             |
| --------------------------------------- | ------------------------------------ | ---------------- |
| `ohstart source add <url>`              |                                      | 添加源           |
| `ohstart source list`                   | `ohstart src ls`                     | 列出已配置的源   |
| `ohstart source view <键名>`            |                                      | 查看源详情       |
| `ohstart source default [键名]`         | `ohstart src def`                    | 查看或设置默认源 |
| `ohstart source rename <键名> [新键名]` | `ohstart src ren` / `ohstart src mv` | 重命名键名       |
| `ohstart source remove <键名>`          | `ohstart src rm`                     | 删除源           |
| `ohstart source trust <键名>`           |                                      | 标记为已信任     |
| `ohstart source untrust <键名>`         |                                      | 撤销信任         |

## 添加源

```bash
ohstart source add https://github.com/<org>/<repo>
```

ohstart 先克隆仓库并读取其 `ohstart.json`, 然后:

- 键名默认取源的 `name`, 可用 `--key <键名>` 指定.
- 键名已被占用时要求重新输入, 直到给出未占用的键名.
- `--note "<备注>"` 写入一条本地备注, 仅自己可见.
- `--trust` 在添加的同时标记为已信任.

```
enter another key name for source templates? my-team
added source my-team (templates) -> https://github.com/<org>/<repo>
```

## 列出源

```bash
ohstart source list
```

```
* my-team (trusted)  templates  https://github.com/<org>/<repo>
  other              templates  https://github.com/<other>/<repo>
```

- 行首 `*` 表示该源为默认源.
- `(trusted)` 表示该源已被信任.

## 查看源详情

```bash
ohstart source view my-team
```

```
key: my-team
name: templates
url: https://github.com/<org>/<repo>
trust: true
note: 团队模板
default: true
```

## 默认源

默认源决定不带 `@` 的脚本地址归属哪个源. 查看:

```bash
ohstart source default
```

设置:

```bash
ohstart source default my-team
```

未设置默认源时执行脚本会直接报错, 并提示先设置一个.

## 重命名键名

```bash
ohstart source rename my-team team-templates
```

键名只影响本地寻址, 与远端仓库名称无关. 新键名已被占用或与原键名相同时会报错. 重命名默认源时, 默认源指向随之更新.

## 删除源

```bash
ohstart source remove my-team
```

删除前要求确认. 删除仅作用于**本地配置**, 远端仓库不受影响. 删除默认源时, 默认源设置一并清除.

## 信任

信任是执行脚本前的门禁, 每个源默认都需要确认一次.

```bash
ohstart source trust my-team     # 标记为已信任
ohstart source untrust my-team   # 撤销信任
```

三种放行方式:

| 情形                 | 行为                           |
| -------------------- | ------------------------------ |
| 源已标记 trusted     | 直接执行                       |
| 源未信任, 交互式终端 | 询问一次, 同意后将信任写入配置 |
| 源未信任, 非交互环境 | 直接报错, 需放行时加 `--trust` |

`--trust` 仅对本次执行生效, 不写入配置:

```bash
ohstart init @my-team/vite/react --trust
```

## 下一步

- [运行脚本](./scripts.md): 源配置完成后如何执行脚本.
- [配置文件规格](../reference/config.md): 配置文件的完整字段.
