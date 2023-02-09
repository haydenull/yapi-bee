// object integer string array
const TYPE = {}

type IInteger = {
  type: 'integer';
  description?: string;
}
type INumber = {
  type: 'number';
  description?: string;
}
type IBoolean = {
  type: 'boolean';
  description?: string;
}
type IString = {
  type: 'string';
  description?: string;
}
type IArray = {
  type: 'array';
  items: IData;
  description?: string;
}
type IObject = {
  type: 'object';
  properties: Record<string, IData>;
  description?: string;
}
type IData = IInteger | IString | IArray | IObject | INumber | IBoolean
const genSpace = (level = 0) => {
  return ' '.repeat(level * 2)
}
const genDescription = (description?: string, space: string = '') => {
  return description ? space + `/** ${description} */\n` : ''
}
const genKey = (key?: string) => key ? `${key}: ` : ''
const genType = ({data, level = 0, key}: {
  data: IData;
  level?: number;
  key?: string;
}): string => {
  const { type, description } = data
  if (type === 'integer' || type === 'number') {
    const space = genSpace(level)
    return genDescription(description, space) + space + genKey(key) + 'number'
  }
  if (type === 'boolean') {
    const space = genSpace(level)
    return genDescription(description, space) + space + genKey(key) + 'boolean'
  }
  if (type === 'string') {
    const space = genSpace(level)
    return genDescription(description, space) + space + genKey(key) + 'string'
  }
  if (type === 'array') {
    const { items } = data
    const _type = genType({ data: items, key, level: level })
    return `${_type}[]`
  }
  if (type === 'object') {
    const { properties } = data
    const _type = Object.keys(properties).map(_key => {
      return genType({ data: properties[_key], key: _key, level: level + 1 }) + ';'
    }).join('\n')
    const space = genSpace(level)
    return genDescription(description, space) + space + genKey(key) + `{\n${_type}\n` + space + '}'
  }
  return ''
}
/**
 * 获取请求体代码
 * @param body yapi 的 res_body
 */
export const genResponseBody = (body: IObject) => {
  return genType({ data: body, level: 0 })
}

const genMockConfigKey = (key?: string, isArray = false) => {
  if (!key) return ''
  return (isArray ? `'${key}|20'` : key) + ': '
}
const genMock = ({ data, level = 0, key, isArray = false }: {
  data: IData;
  level?: number;
  key?: string;
  isArray?: boolean;
}) : string => {
  const { type } = data
  const primitiveBracketStart = isArray ? '[' : ''
  const primitiveBracketEnd = isArray ? ']' : ''
  if (type === 'integer' || type === 'number') return genSpace(level) + genMockConfigKey(key, isArray) + primitiveBracketStart + "'@integer(1, 100)'" + primitiveBracketEnd
  if (type === 'boolean') return genSpace(level) + genMockConfigKey(key, isArray) + primitiveBracketStart + "'@boolean'" + primitiveBracketEnd
  if (type === 'string') return genSpace(level) + genMockConfigKey(key, isArray) + primitiveBracketStart + "'@cword(1, 10)'" + primitiveBracketEnd
  if (type === 'array') {
    const { items } = data
    const _type = genMock({ data: items, key, level: level, isArray: true })
    return _type
  }
  if (type === 'object') {
    const { properties } = data
    const _type = Object.keys(properties).map(_key => {
      return genMock({ data: properties[_key], key: _key, level: level + 1 }) + ','
    }).join('\n')
    const objectBracketStart = isArray ? '[{' : '{'
    const objectBracketEnd = isArray ? '}]' : '}'
    return genSpace(level) + genMockConfigKey(key, isArray) + objectBracketStart + `\n${_type}\n` + genSpace(level) + objectBracketEnd
  }
  return ''
}
/**
 * 声明 mockjs 配置
 * @param body yapi 的 res_body
 */
export const genMockConfig = (body: IData) => {
  return genMock({ data: body, level: 0 })
}


export const genReqQueryType = (query: {
  name: string;
  desc?: string;
  required?: '0' | '1';
}[]) => {
  if (query?.length <= 0) return ''
  return `{\n${query.map(({ name, desc, required }) => {
    const _desc = desc ? genSpace(1) + `/** ${desc} */\n` : ''
    return _desc + genSpace(1) + `${name}${required === '1' ? '' : '?'}: string;`
  }).join('\n')}\n}`
}