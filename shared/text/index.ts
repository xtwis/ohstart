import { debug } from "@shared/text/debug"
import { description } from "@shared/text/description"
import { error } from "@shared/text/error"
import { label } from "@shared/text/label"
import { next } from "@shared/text/next"
import { question } from "@shared/text/question"
import { state } from "@shared/text/state"
import { success } from "@shared/text/success"
import { terms } from "@shared/text/terms"
import { warning } from "@shared/text/warning"

export const text = {
  terms,
  error,
  success,
  state,
  question,
  warning,
  next,
  label,
  debug,
  description,
} as const
