import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "check",
    description: "校验源契约并在沙盒里试跑脚本",
  },
  args: {
    script: {
      type: "positional",
      required: false,
      description: "只检查指定脚本, 省略则检查全部",
    },
  },
})
