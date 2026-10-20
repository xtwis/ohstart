export interface ConfirmOptions {
  default?: boolean
}

export interface InputOptions {
  default?: string
  validate?: (value: string) => true | string
}

export interface SelectOption {
  label: string
  value?: string
}
