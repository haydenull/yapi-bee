import { useEffect, useState } from 'react'
import { Button, Form, Input, Divider, Descriptions, Empty, message } from 'antd'
import { getAPIDetail } from './services/yapi'
import { genMockConfig, genReqQueryType, genResponseBody } from './util'
import CodeBlock from './components/CodeBlock'
import genColumns, { DEFAULT_DATA_PATH } from './helper/genColumns'
import { genValibotSchema } from './helper/genValibot'
import { ValibotSchemaOption } from './components/ValibotSchemaOption'

type IForm = {
  token: string
  apiId: string
}

function App() {
  const [form] = Form.useForm<IForm>()

  // yapi 返回值比较复杂，这里只是简单的展示
  const [apiInfo, setApiInfo] = useState<any>()

  const [data, setData] = useState<{
    // Antd Table Columns
    columns?: string
    // 请求参数类型
    reqQueryType?: string
    // 请求体类型
    reqBodyType?: string
    // 响应体类型
    resBodyType?: string
    /** valibot schema */
    valibotSchema?: string
    // mock 数据
    mock?: string
  }>()

  const onClickGenColumns = () => {
    const { res_body } = apiInfo || {}
    if (!res_body) return message.error('响应体为空')
    const dataPath = form.getFieldValue('dataPath')
    const columns = genColumns(res_body, dataPath)
    setData((prev) => ({ ...prev, columns }))
  }

  useEffect(() => {
    const queryData = async (apiId: string, token: string) => {
      const res = await getAPIDetail(apiId, token)
      const data = await res.json()
      const { req_query, req_body_other = '{}', res_body = '{}' } = data.data
      const reqBody = JSON.parse(req_body_other)
      const resBody = JSON.parse(res_body)
      setApiInfo({ ...data.data, req_body_other: reqBody, res_body: resBody })
      setData({
        reqQueryType: genReqQueryType(req_query),
        reqBodyType: genResponseBody(reqBody),
        resBodyType: genResponseBody(resBody),
        valibotSchema: await genValibotSchema(resBody),
        mock: genMockConfig(resBody),
      })
    }
    const boot = (
      projectList: {
        name: string
        id: string
        token: string
      }[],
    ) => {
      // 获取当前 tab 的 url
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        const url = tab.url
        console.log('[faiz:] === url', url, tabs)
        // url: https://yapi.inner.youdao.com/project/646/interface/api/65355
        // 解析 url 获取项目 id 和接口 id
        const match = url?.match(/project\/(\d+)\/interface\/api\/(\d+)/)
        if (!match) return message.error('当前页面无法解析, 请确保进入具体接口页面后再启用插件')
        const projectId = match[1]
        const apiId = match[2]
        const project = projectList.find((item) => item.id === projectId)
        if (!project) return message.error('当前项目未配置 token, 请先前往设置页配置 token')
        const token = project.token
        queryData(apiId, token)
      })
    }
    // 从 local 获取数据
    chrome.storage.sync.get(['projectList'], (result) => {
      boot(result.projectList)
    })
  }, [])

  return (
    <div className="py-2 px-4 min-w-[550px]">
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

      {apiInfo ? (
        <>
          <Divider />

          <Descriptions title="基础信息">
            <Descriptions.Item label="接口名称">{apiInfo?.title}</Descriptions.Item>
            <Descriptions.Item label="接口地址">{apiInfo?.path}</Descriptions.Item>
            <Descriptions.Item label="请求方法">{apiInfo?.method}</Descriptions.Item>
          </Descriptions>
        </>
      ) : null}

      <Divider />

      <Form layout="inline" form={form} initialValues={{ dataPath: DEFAULT_DATA_PATH }}>
        <Form.Item
          label="取值路径"
          name="dataPath"
          tooltip="假设接口返回值为 res, 取值路径为 data.data, 那么取出的值为 res.data.data. 另外请确保取出的值是 object[]"
        >
          <Input style={{ width: 200 }} placeholder="请输入取值路径" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={onClickGenColumns}>
            🌸 生成 Antd Table Columns
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div>
        {data?.columns ? <CodeBlock title="Antd Table Columns" text={data?.columns} /> : null}
        {data?.reqQueryType ? <CodeBlock title="请求参数类型" text={data?.reqQueryType} /> : null}
        {data?.reqBodyType ? <CodeBlock title="请求体类型" text={data?.reqBodyType} /> : null}
        {data?.resBodyType ? <CodeBlock title="响应体类型" text={data?.resBodyType} /> : null}
        {data?.valibotSchema ? (
          <CodeBlock
            title={
              <div className="flex flex-row justify-between">
                <span>valibot 结构</span>
                <ValibotSchemaOption
                  onChange={async (v) => {
                    setData({
                      ...data,
                      valibotSchema: await genValibotSchema(apiInfo.res_body, v),
                    })
                  }}
                />
              </div>
            }
            text={data?.valibotSchema}
          />
        ) : null}
        {data?.mock ? <CodeBlock title="Mockjs 配置" text={data?.mock} /> : null}
      </div>

      {!data && !apiInfo ? (
        <Empty
          className="mt-10"
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          description={
            <span className="text-gray-400">输入正确的 Token 与 项目 ID 后, 就可以让小蜜蜂帮你生成接口类型啦 🐝</span>
          }
        />
      ) : null}
    </div>
  )
}

export default App
