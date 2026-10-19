import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "version",
    description: "打印 ohstart 版本号",
  },
  run() {
    console.log("0.1.0")
  },
})
