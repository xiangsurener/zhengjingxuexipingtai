import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../services/api'

export default function Lesson() {
  const { id } = useParams()
  const [node, setNode] = useState(null)
  const [input, setInput] = useState('')

  const next = async () => {
    const { data } = await api.post('/lesson/next', {
      lessonId: id,
      currentNodeId: node?.id ?? null,
      userInput: input
    })
    setNode(data.node)
    setInput('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">课程：{id}</h2>
      <div className="rounded-xl bg-white p-6 shadow min-h-40">
        {node ? (
          <>
            <p className="mb-4">{node.content ?? node.question}</p>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="在此输入答案或与老师对话"
              className="w-full border rounded p-2"
            />
          </>
        ) : (
          <p>点击“下一步”开始本课</p>
        )}
      </div>
      <button onClick={next} className="mt-4 px-4 py-2 rounded bg-blue-600 text-white">
        下一步
      </button>
    </div>
  )
}