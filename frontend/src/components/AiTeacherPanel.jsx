import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/api'

/**
 * Shared AI teacher Q&A panel. Allows embedding inside页面或独立页。
 */
export default function AiTeacherPanel({
  lessonId,
  lessonTitle,
  conversationHeight = 224
}) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const clientId = useMemo(() => ensureClientId(), [])
  const listEndRef = useRef(null)

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const askTeacher = async () => {
    const content = question.trim()
    if (!content) return
    setError('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', text: content }])
    setQuestion('')
    try {
      const { data } = await api.post('/ai_teacher/ask', {
        question: content,
        client_id: clientId,
        file: 'DAY1.txt',
        meta: { lessonId, lessonTitle }
      })
      const answer = data?.answer || 'AI教师暂时没有合适的回答，请稍后再试。'
      setMessages(prev => [...prev, { role: 'assistant', text: answer }])
    } catch (err) {
      setError('无法连接后端 AI 教师，请确认 Flask 服务已启动。')
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: '后端暂时无法连接，请稍后重试或检查服务状态。' }
      ])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-slate-900">AI 教师问答</h3>
      <p className="text-sm text-slate-500 mt-1">
        提问时尽量描述你当前学习到的段落或遇到的困惑，AI 教师会结合剧本内容给出提示。
      </p>

      <div className="mt-4 space-y-3 flex-1 overflow-hidden">
        <div
          className="overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-3 text-sm"
          style={{ height: conversationHeight }}
        >
          {messages.length === 0 && (
            <p className="text-slate-500 text-center py-10">
              暂无对话，尝试提问：<br />
              “随机梯度下降为什么不会陷入死胡同？”
            </p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-xl px-3 py-2 leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white border border-blue-100 text-slate-700'
                  : 'bg-blue-600 text-white ml-auto max-w-[85%]'
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={listEndRef} />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="space-y-2">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="向 AI 教师提问..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={askTeacher}
            disabled={loading || !question.trim()}
            className="w-full rounded-xl bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'AI 教师正在思考...' : '发送问题'}
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        若需调试后端连接，可使用 <code>frontend/public/ai-teacher-sandbox.html</code> 里的测试工具。
      </p>
    </div>
  )
}

function ensureClientId() {
  const key = 'ai_teacher_client_id'
  try {
    const cached = localStorage.getItem(key)
    if (cached) return cached
    const id = `c-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(key, id)
    return id
  } catch {
    return `c-${Math.random().toString(36).slice(2, 10)}`
  }
}
