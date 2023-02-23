import { useEffect, useReducer, useState } from 'react'
import { Button, Form, Input, Divider, Descriptions, Empty, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
// import chrome from 'chrome-extensions-api'

type IForm = {
  projectList: {
    name: string
    id: string
    token: string
  }[]
}

function App() {

  const [form] = Form.useForm<IForm>()

  const onClickOk = async () => {
    const values = await form.validateFields()
    console.log(values)
    // const { apiId, token } = values
    // 存储到 localStorage
    // localStorage.setItem('token', token)
    // localStorage.setItem('apiId', apiId)
    // 存储到 local
    chrome.storage.sync.set({ projectList: values.projectList }, () => {
      console.log('保存成功')
      message.success('Save Success!')
    })

  }

  useEffect(() => {
    // 从 local 获取数据
    chrome.storage.sync.get(['projectList'], (result) => {
      console.log('获取成功', result)
      form.setFieldsValue({
        projectList: result.projectList
      })
    })
  }, [])

  return (
    <div className="py-10 px-10">
      {/* <h1 className="mb-1">Bee - Yapi 小蜜蜂 🐝</h1> */}

      <Form<IForm> layout="horizontal" form={form}>
        <Form.Item label="Project List" noStyle>
          <Form.List name="projectList">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div className="flex" key={field.key}>
                    {/* <Form.Item label="Yapi Domain" name="domain" rules={[{ required: true }]}> */}
                    <Form.Item label={`Project Name ${index + 1}`} name={[field.name, 'name']}>
                      <Input placeholder="Project Name" />
                    </Form.Item>
                    <Form.Item label={`Project ID ${index + 1}`} name={[field.name, 'id']} rules={[{ required: true }]}>
                      <Input placeholder="Project ID" />
                    </Form.Item>
                    <Form.Item label={`Project Token ${index + 1}`} name={[field.name, 'token']} rules={[{ required: true }]}>
                      <Input placeholder="Project Token" />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Project
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Button type="primary" onClick={onClickOk}>🌸 Save</Button>
      </Form>
    </div>
  )
}

export default App
