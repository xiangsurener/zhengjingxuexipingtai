import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/api'
import { day1Lesson } from '../data/day1'
import { useAuth } from '../hooks/useAuth'

const lessons = {
  nn: day1Lesson
}

export default function Lesson() {
  const { id } = useParams()
  const lesson = lessons[id]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quizState, setQuizState] = useState({})
  const { user } = useAuth()
  const totalSegments = lesson?.segments.length ?? 0

  useEffect(() => {
    setCurrentIndex(0)
    setQuizState({})
  }, [id])

  useEffect(() => {
    if (!lesson || !user) return
    let cancelled = false
    api.get(`/progress/${lesson.id}`).then(res => {
      if (cancelled) return
      const idx = typeof res.data.currentIndex === 'number' ? res.data.currentIndex : -1
      const safeIndex = idx >= 0 ? Math.min(totalSegments - 1, idx) : 0
      setCurrentIndex(safeIndex)
    }).catch(() => {
      if (!cancelled) setCurrentIndex(0)
    })
    return () => { cancelled = true }
  }, [lesson?.id, user, totalSegments])

  const persistProgress = (index) => {
    if (!user || !lesson) return
    api.post(`/progress/${lesson.id}`, { index }).catch(err => {
      console.error('同步进度失败', err)
    })
  }

  const goToSegment = (index) => {
    if (!lesson) return
    const clamped = Math.min(Math.max(index, 0), totalSegments - 1)
    if (clamped === currentIndex) return
    setCurrentIndex(clamped)
    if (user) {
      persistProgress(clamped)
    }
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold mb-4">课程建设中</h1>
        <p className="text-slate-600">我们正在为该课程准备内容，敬请期待。</p>
      </div>
    )
  }

  const segments = lesson.segments
  const segment = segments[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / segments.length) * 100)

  const onSelectOption = (segmentId, optionKey, answer, explanation) => {
    setQuizState(prev => ({
      ...prev,
      [segmentId]: {
        selected: optionKey,
        isCorrect: optionKey === answer,
        explanation
      }
    }))
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-slate-500 uppercase tracking-wide">课程 · {lesson.estimatedDuration}</p>
        <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
        <p className="text-slate-600 max-w-3xl">{lesson.intro}</p>
        <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-slate-500">进度：{currentIndex + 1} / {segments.length}（{progressPercent}%）</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <main className="space-y-6">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-7 space-y-6">
            <div className="space-y-1">
              <p className="text-sm text-blue-600 font-medium">当前单元</p>
              <h2 className="text-2xl font-semibold text-slate-900">{segment.title}</h2>
              {segment.duration && <p className="text-sm text-slate-500">建议时长：{segment.duration}</p>}
            </div>
            <SegmentContent
              segment={segment}
              quizState={quizState[segment.id]}
              onSelectOption={onSelectOption}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => goToSegment(currentIndex - 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              上一段
            </button>
            <div className="flex-1 text-center text-sm text-slate-500">
              {segment.type === 'quiz'
                ? '选择答案后查看解释，再点击下一段继续'
                : '阅读完本段内容后继续下一段'}
            </div>
            <button
              onClick={() => goToSegment(currentIndex + 1)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={currentIndex === segments.length - 1}
            >
              下一段
            </button>
          </div>
        </main>

        <aside className="space-y-6">
          <OutlineCard
            segments={segments}
            currentIndex={currentIndex}
            onJump={goToSegment}
            quizState={quizState}
          />
          <AiTeacherPanel lessonId={lesson.id} lessonTitle={lesson.title} />
        </aside>
      </div>
    </div>
  )
}

function SegmentContent({ segment, quizState, onSelectOption }) {
  if (segment.type === 'quiz') {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-lg font-medium text-slate-800">{segment.question}</p>
          <p className="text-sm text-slate-500 mt-1">选择你认为正确的选项：</p>
        </div>
        <div className="space-y-3">
          {segment.options.map(opt => {
            const checked = quizState?.selected === opt.key
            return (
              <label
                key={opt.key}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                  checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name={segment.id}
                  value={opt.key}
                  checked={checked}
                  onChange={() => onSelectOption(segment.id, opt.key, segment.answer, segment.explanation)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">{opt.key}</span>
                <span className="text-slate-700 flex-1">{opt.text}</span>
              </label>
            )
          })}
        </div>
        {quizState?.selected && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              quizState.isCorrect
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            <p className="font-medium">
              {quizState.isCorrect ? '回答正确！' : `正确答案是 ${segment.answer}`}
            </p>
            <p className="mt-1 leading-relaxed">{segment.explanation}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {segment.video && (
        <div className="rounded-2xl overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={segment.video.src}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={segment.video.title}
            />
          </div>
        </div>
      )}
      {!segment.video && segment.mediaPlaceholder && (
        <div className="rounded-2xl bg-slate-100 border border-dashed border-slate-300 aspect-video flex items-center justify-center text-slate-500 text-sm">
          {segment.mediaPlaceholder || '视频占位'}
        </div>
      )}
      {segment.hero && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-blue-700 text-sm">
          {segment.hero}
        </div>
      )}
      <div className="space-y-3 text-slate-700 leading-relaxed">
        {segment.transcript?.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
      {segment.keyPoints?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">关键要点</h3>
          <ul className="mt-2 space-y-2 text-slate-700">
            {segment.keyPoints.map((point, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function OutlineCard({ segments, currentIndex, onJump, quizState }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">课程大纲</h3>
      <ol className="space-y-2 text-sm text-slate-600">
        {segments.map((seg, idx) => {
          const isActive = idx === currentIndex
          const finished = idx < currentIndex
          const quizResult = seg.type === 'quiz' ? quizState?.[seg.id] : null
          return (
            <li key={seg.id}>
              <button
                onClick={() => onJump(idx)}
                className={`w-full text-left rounded-xl px-3 py-2 transition border ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : finished
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{seg.title}</span>
                  {seg.type === 'quiz' && quizResult?.selected && (
                    <span className={`text-xs font-semibold ${quizResult.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                      {quizResult.isCorrect ? '✔' : '提示'}
                    </span>
                  )}
                </div>
                {seg.duration && <p className="text-xs text-slate-500 mt-0.5">{seg.duration}</p>}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function AiTeacherPanel({ lessonId, lessonTitle }) {
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
        <div className="h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-3 text-sm">
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
