---
title: 契约字段
order: 3
---

# {{ $frontmatter.title }}

契约由两份 JSON 构成: 源根的 `ohstart.json` 声明有哪些脚本, 脚本目录的 `script.json` 声明单个脚本的元信息.

## 两个文件

| 文件           | 位置     | 作用                                 |
| -------------- | -------- | ------------------------------------ |
| `ohstart.json` | 源根     | 脚本名到脚本路径的映射               |
| `script.json`  | 脚本目录 | 脚本自身的名称, 类型, 描述与文件入口 |

脚本目录由 `ohstart.json` 的映射决定, `script.json` 只在该目录内生效.

## ohstart.json

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

| 字段          | 类型     | 必需 | 说明                     |
| ------------- | -------- | ---- | ------------------------ |
| `name`        | `string` | 是   | 源名, 不可为空           |
| `author`      | `string` | 是   | 作者, 可为空字符串       |
| `description` | `string` | 是   | 源描述, 可为空字符串     |
| `scripts`     | `object` | 是   | 键为脚本名, 值为脚本路径 |

约束:

- 整个文件必须是 JSON 对象.
- `name`, `author`, `description` 缺失或非字符串均报错.
- `scripts` 缺失或非对象报错.
- `scripts` 的键不得为空字符串, 值必须是字符串.
- 值的路径相对源根, 必须位于源根之内.
- 同一个路径不得对应两个脚本名, 该约束只在 `ohsd check` 中检查.
- 键与值不必相同: 键是调用时使用的名称, 值是该脚本的目录. 两者都可含 `/` 分级.

`ohsd new` 写回该文件时只保留上述四个字段, 其余字段会被丢弃.

## script.json

```json
{
  "name": "lint/eslint",
  "type": "add",
  "description": "安装一套 eslint 配置",
  "entry": "index.ts",
  "argv": "argv.ts"
}
```

| 字段          | 类型                | 必需 | 说明                                 |
| ------------- | ------------------- | ---- | ------------------------------------ |
| `name`        | `string`            | 是   | 脚本名, 须与 `ohstart.json` 的键一致 |
| `type`        | `"init"` \| `"add"` | 是   | 决定由 `init` 还是 `add` 执行        |
| `description` | `string`            | 是   | 一句话描述, `ohstart list` 会显示    |
| `entry`       | `string`            | 否   | 入口文件, 默认 `index.ts`            |
| `argv`        | `string`            | 否   | 参数定义文件, 默认 `argv.ts`         |

约束:

- 整个文件必须是 JSON 对象.
- `name`, `type`, `description` 缺失或非字符串均报错.
- `name` 不可为空, 且须与登记的键完全一致.
- `type` 取 `init` 或 `add`, 其他值报错.
- `entry` 与 `argv` 省略时使用默认文件名, 指定的值相对脚本目录.
- 入口文件与参数文件的完整性由 `ohsd check` 与执行阶段检查, 不在此文件的解析阶段检查.

## 默认文件

| 名称       | 常量    | 用途                                            |
| ---------- | ------- | ----------------------------------------------- |
| `index.ts` | `entry` | 打包执行的入口, 须默认导出函数                  |
| `argv.ts`  | `argv`  | 参数定义, 须默认导出 `defineArgv(...)` 的返回值 |

参数定义与入口的实现要求见 [脚本契约](../script/contract.md).

## 校验时机

| 场景                            | 读取内容                                 |
| ------------------------------- | ---------------------------------------- |
| `ohstart source add`            | `ohstart.json` 的 `name`                 |
| `ohstart list`                  | 两份文件, 单个脚本出错时跳过并警告       |
| `ohstart init` / `add` / `view` | 两份文件与目标脚本, 出错即中止           |
| `ohsd new`                      | `ohstart.json`, 并检查名称与路径是否重复 |
| `ohsd check`                    | 全量, 逐条给出 error 与 warning          |

报错文案与处理办法见 [错误对照](./errors.md).

## 下一步

- [脚本契约](../script/contract.md): 目录结构, 入口与参数定义.
- [配置文件](./config.md): 本地源配置.
- [错误对照](./errors.md): 契约相关的报错文案.
