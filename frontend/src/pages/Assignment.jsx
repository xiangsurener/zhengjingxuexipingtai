import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../services/api'

export default function Assignment() {
  const { id } = useParams()
  const [content, setContent] = useState('')

  const submit = async () => {
    const { data } = await api.post('/assignment/submit', { assignmentId: id, content })
    alert(data.message)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">作业：{id}</h2>
      <textarea
        className="w-full h-48 border rounded p-2"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button onClick={submit} className="mt-4 px-4 py-2 rounded bg-green-600 text-white">
        提交作业
      </button>
    </div>
  )
}