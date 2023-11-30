import { IData } from '../interface'
import * as prettier from 'prettier'
import typescriptPlugin from 'prettier/plugins/typescript'
import estreePlugin from 'prettier/plugins/estree'

const optional = (v: string, condition: boolean) => (condition ? `optional(${v})` : v)
const nullable = (v: string, condition: boolean) => (condition ? `nullable(${v})` : v)

type WrapEmptyOption = 'optional' | 'nullable' | 'both'

export interface GenValibotSchemaOption {
  /** 空值包裹 nullable optional 或两个一起 */
  wrapEmpty?: WrapEmptyOption
  /** description 是否转为 注释 */
  descriptionToComment?: boolean
  /** 将使用到的类型函数引入 */
  withImport: boolean
}

export const defaultGenValidSchemaOption: GenValibotSchemaOption = {
  wrapEmpty: 'optional',
  descriptionToComment: true,
  withImport: false,
}

type ValibotMethods = 'string' | 'boolean' | 'array' | 'number' | 'object' | 'optional' | 'nullable'

const IDataTypeMapValibotMethod: Partial<Record<IData['type'], ValibotMethods>> = {
  integer: 'number',
}

export async function genValibotSchema(root: IData, option?: GenValibotSchemaOption) {
  const { wrapEmpty, descriptionToComment, withImport } = { ...defaultGenValidSchemaOption, ...(option ?? {}) }
  const importMethods = new Set<ValibotMethods>([])

  function addImportMethod(method: ValibotMethods) {
    if (withImport && !importMethods.has(method)) {
      importMethods.add(method)
    }
  }

  function withComment(v: string, item: IData) {
    const comment = descriptionToComment && item.description ? `\n/** ${item.description} */\n` : ''
    return `${comment}${v}`
  }

  function withImportHeader() {
    if (!withImport || !importMethods.size) return ''

    return `import {${[...importMethods].join(',')}} from "valibot"`
  }

  const withEmptyValue = (v: string, condition: boolean, emptyWrap: WrapEmptyOption = 'optional'): string => {
    switch (emptyWrap) {
      case 'both': {
        addImportMethod('nullable')
        addImportMethod('optional')
        return optional(nullable(v, condition), condition)
      }
      case 'nullable':
        addImportMethod('nullable')
        return nullable(v, condition)
      case 'optional':
      default:
        addImportMethod('optional')
        return optional(v, condition)
    }
  }

  function helper(data: IData): string {
    const valibotType = (IDataTypeMapValibotMethod[data.type] ?? data.type) as ValibotMethods

    addImportMethod(valibotType)

    switch (data.type) {
      case 'array': {
        return `array(${helper(data.items)})`
      }
      case 'object': {
        return `object({${(<[string, IData][]>Object.entries(data.properties ?? {})).reduce((r, [key, value]) => {
          const isRequired = data.required && !data.required?.includes(key)
          const v = withEmptyValue(helper(value), isRequired, wrapEmpty)
          return r + withComment(`${key}: ${v},`, value)
        }, '')}})`
      }

      case 'boolean': {
        return 'boolean()'
      }

      case 'integer':
      case 'number':
        return 'number()'
      case 'string':
        return 'string()'
    }
  }

  const v = helper(root)

  return `${await prettier.format(`${withImportHeader()}\n\n${v}`, {
    parser: 'typescript',
    plugins: [typescriptPlugin, estreePlugin],
    singleQuote: true,
    useTabs: false,
    tabWidth: 2,
  })}`
}
