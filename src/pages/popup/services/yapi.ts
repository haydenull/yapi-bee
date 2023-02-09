const BASE_URL = 'https://yapi.inner.youdao.com'

export const getAPIDetail = (id: string, token: string) => {
  return fetch(`${BASE_URL}/api/interface/get?id=${id}&token=${token}`)
}