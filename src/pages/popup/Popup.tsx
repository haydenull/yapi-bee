import { useEffect, useReducer, useState } from 'react'
import { Button, Form, Input, Divider, Descriptions, Empty } from 'antd'
import { getAPIDetail } from './services/yapi'
import { genMockConfig, genReqQueryType, genResponseBody } from './util'
import CodeBlock from './components/CodeBlock'

type IForm = {
  token: string
  apiId: string
}

function App() {

  const [form] = Form.useForm<IForm>()

  // yapi 返回值比较复杂，这里只是简单的展示
  const [apiInfo, setApiInfo] = useState<any>()
  console.log('[faiz:] === apiInfo', apiInfo)

  const [data, setData] = useState<{
    // 请求参数类型
    reqQueryType?: string
    // 请求体类型
    reqBodyType?: string
    // 响应体类型
    resBodyType?: string
    // mock 数据
    mock?: string
  }>()

  const queryData = async (apiId: string, token: string) => {

    const res = await getAPIDetail(apiId, token)
    const data = await res.json()
    console.log('[faiz:] === data', data)
    setApiInfo(data.data)
    const { req_query, req_body_other = '{}', res_body = '{}' } = data.data

    const reqBody = JSON.parse(req_body_other)
    const resBody = JSON.parse(res_body)
    setData({
      reqQueryType: genReqQueryType(req_query),
      reqBodyType: genResponseBody(reqBody),
      resBodyType: genResponseBody(resBody),
      mock: genMockConfig(resBody),
    })
  }
  const boot = (projectList: {
    name: string
    id: string
    token: string
  }[]) => {
    // 获取当前 tab 的 url
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      const url = tab.url
      console.log('[faiz:] === url', url, tabs)
      // url: https://yapi.inner.youdao.com/project/646/interface/api/65355
      // 解析 url 获取项目 id 和接口 id
      const match = url?.match(/project\/(\d+)\/interface\/api\/(\d+)/)
      if (match) {
        const projectId = match[1]
        const apiId = match[2]
        const project = projectList.find((item) => item.id === projectId)
        if (project) {
          const token = project.token
          queryData(apiId, token)
        }
      }
    })
  }

  useEffect(() => {
    // 从 local 获取数据
    chrome.storage.local.get(['projectList'], (result) => {
      console.log('获取成功', result)
      boot(result.projectList)
    })
  }, [])

  return (
    <div className="py-2 px-4 min-w-[300px]">
      <h1 className="mb-1">Bee - Yapi 小蜜蜂 🐝</h1>

      {/* <div className="text-sm text-gray-400 mb-6">由于 yapi 接口存在跨域限制, 请先安装<a href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf" target="_blank">ALLOW CORS 插件</a>并打开。(将来小蜜蜂进化为插件形态后就不会有这个限制了) <a href="https://gitlab.corp.youdao.com/hikari/f2e/bee" target="_blank">详细说明点击这里查看</a></div> */}

      {/* <Form<IForm> layout="inline" form={form}>
        <Form.Item label="Yapi Token" name="token" rules={[{required: true}]} tooltip="项目-设置-token配置">
          <Input style={{ width: 400 }} placeholder="请输入 Token" />
        </Form.Item>
        <Form.Item label="接口 ID" name="apiId" rules={[{required: true}]} tooltip="接口 yapi url 最后几位数字">
          <Input placeholder="请输入 ID" />
        </Form.Item>
        <Button type="primary" onClick={onClickOk}>🌸 小蜜蜂帮帮我</Button>
      </Form> */}

      {
        apiInfo
        ? (<>
          <Divider />

          <Descriptions title="基础信息">
            <Descriptions.Item label="接口名称">{apiInfo?.title}</Descriptions.Item>
            <Descriptions.Item label="接口地址">{apiInfo?.path}</Descriptions.Item>
            <Descriptions.Item label="请求方法">{apiInfo?.method}</Descriptions.Item>
          </Descriptions>
        </>)
        : null
      }

      <Divider />

      <div>
        {data?.reqQueryType ? <CodeBlock title="请求参数类型" text={data?.reqQueryType} /> : null}
        {data?.reqBodyType ? <CodeBlock title="请求体类型" text={data?.reqBodyType} /> : null}
        {data?.resBodyType ? <CodeBlock title="响应体类型" text={data?.resBodyType} /> : null}
        {data?.mock ? <CodeBlock title="Mockjs 配置" text={data?.mock} /> : null}
      </div>

      {
        !data && !apiInfo
        ? (
          <Empty
            className="mt-10"
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            description={<span className="text-gray-400">输入正确的 Token 与 api ID后, 就可以让小蜜蜂帮你生成接口类型啦 🐝</span>}
          />)
        : null
      }
    </div>
  )
}

export default App
