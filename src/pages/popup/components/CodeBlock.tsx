import React, { useState } from 'react'
import { CopyOutlined } from '@ant-design/icons'
import copy from 'copy-to-clipboard'
import { message } from 'antd'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 忽略类型文件
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 忽略无类型文件
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CODE_BLOCK_CONFIG = {
  language: 'typescript',
  showLineNumbers: true,
  wrapLines: true,
}
const CodeBlock: React.FC<{
  text: string
  title: React.ReactNode
}> = ({ text, title }) => {
  const onClickCopy = () => {
    copy(text)
    message.success('Copy Success! 🎉')
  }

  return (
    <div>
      <h3>{title}</h3>
      <div className="relative">
        <SyntaxHighlighter {...CODE_BLOCK_CONFIG} style={dracula}>
          {text}
        </SyntaxHighlighter>
        <CopyOutlined className="absolute right-3 top-3 text-white cursor-pointer" onClick={onClickCopy} />
      </div>
    </div>
  )
}

export default CodeBlock
