---
title: 配置文件
order: 4
---

# {{ $frontmatter.title }}

本地源配置保存在 `config.json` 中, 记录已添加的源与默认源.

## 路径

| 条件                     | 路径                                   |
| ------------------------ | -------------------------------------- |
| 设置了 `XDG_CONFIG_HOME` | `$XDG_CONFIG_HOME/ohstart/config.json` |
| Windows                  | `%APPDATA%\ohstart\config.json`        |
| 其他平台                 | `~/.config/ohstart/config.json`        |

`XDG_CONFIG_HOME` 优先于平台默认值, Windows 上同样生效. `APPDATA` 未设置时回落到 `~/AppData/Roaming`.

## 结构

```json
{
  "source": {
    "my-team": {
      "name": "templates",
      "url": "git@github.com:team/templates.git",
      "trust": true,
      "note": "团队模板"
    }
  },
  "default": "my-team"
}
```

### source

键为本地键名, 值为该源的配置.

| 字段    | 类型      | 必需 | 说明                                  |
| ------- | --------- | ---- | ------------------------------------- |
| `name`  | `string`  | 是   | 源内 `ohstart.json` 声明的源名        |
| `url`   | `string`  | 是   | 源的 git 地址, 按原样传入 `git clone` |
| `trust` | `boolean` | 否   | 为 `true` 时跳过执行前的信任确认      |
| `note`  | `string`  | 否   | 本地备注                              |

### default

默认源的键名. 省略时表示未设置默认源, 此时 `ohstart init` / `add` / `list` / `view` 要求脚本地址带 `@<键名>/` 前缀, 否则报错.

## 读写行为

| 行为       | 说明                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| 文件不存在 | 视为空配置, 不报错, 首次写入时创建目录与文件                                    |
| 写入格式   | 两空格缩进的 JSON, 末尾带换行                                                   |
| 立即写回   | `source add` / `remove` / `rename` / `trust` / `untrust` / `default` 均即时写入 |
| 运行期写入 | 交互确认信任后, 该源的 `trust` 被置为 `true` 并写回                             |
| 读取校验   | 不做字段校验, 内容非法时直接抛出 JSON 解析错误                                  |

配置为明文, 不含凭据. 源的访问权限由 git 自身决定.

## 下一步

- [管理源](../guide/sources.md): 通过命令维护配置.
- [ohstart 命令参考](./cli.md): 各 `source` 子命令的参数.
