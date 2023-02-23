interface TableColumn {
  title: string;
  dataIndex: string | string[];
  renderText?: string;
}

export const DEFAULT_NAME_KEYWORDS = ['name', 'title']
export const DEFAULT_DATA_PATH = 'data.data'

function convertDataPath(path: string): string {
  return `properties.${path.replace(/\./g, '.properties.')}`;
}

export default function generateColumns(jsonStr: string, dataPath = DEFAULT_DATA_PATH, nameKeywords = DEFAULT_NAME_KEYWORDS): string {
  const json = JSON.parse(jsonStr);
  const _dataPath = convertDataPath(dataPath);
  const data = _dataPath?.split('.').reduce((obj, key) => obj?.[key], json);

  if (data?.type !== 'array') return '[]'

  const properties = data.items?.properties;
  const columns: TableColumn[] = [];

  for (const key in properties) {
    const prop = properties[key];

    if (prop.type === "object") {
      for (const subKey in prop.properties) {
        if (nameKeywords.some(keyword => subKey.toLowerCase().includes(keyword.toLowerCase()))) {
          columns.push({
            title: prop.description || subKey,
            dataIndex: [key, subKey],
          });
        }
      }
    } else if (prop.type === "array") {
      const items = prop.items;
      if (items && items.type === "object") {
        const nameKey = Object.keys(items.properties).find(_key => nameKeywords.some(keyword => _key.toLowerCase().includes(keyword.toLowerCase())))
        const renderText = `value => value?.map(v => v?.${nameKey})?.join(', ')`
        columns.push({
          title: prop.description || key,
          dataIndex: key,
          renderText,
        });
      } else {
        columns.push({
          title: prop.description || key,
          dataIndex: key,
          renderText: `value => value?.join(', ')`,
        });
      }
    } else {
      columns.push({
        title: prop.description || key,
        dataIndex: key,
      });
    }
  }

  return JSON.stringify(columns, null, 2)
  // 去掉键名引号
  .replace(/"(\w+)":/g, '$1:')
  // 将键值双引号改为单引号
  .replace(/"/g, "'")
}