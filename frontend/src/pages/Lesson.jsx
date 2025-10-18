import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { day1Lesson } from '../data/day1'
import { useAuth } from '../hooks/useAuth'
import FloatingAiTutorLink from '../components/FloatingAiTutorLink'

const lessons = {
  nn: day1Lesson
}

const QUIZ_STORAGE_PREFIX = 'lp.lesson.quizState.'
const QUIZ_LOCK_PREFIX = 'lp.lesson.quizLocked.'

export default function Lesson() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lesson = lessons[id]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(0)
  const [quizState, setQuizState] = useState({})
  const [answersLocked, setAnswersLocked] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const { user } = useAuth()
  const totalSegments = lesson?.segments.length ?? 0
  const quizStorageKey = lesson ? `${QUIZ_STORAGE_PREFIX}${lesson.id}` : null
  const lockStorageKey = lesson ? `${QUIZ_LOCK_PREFIX}${lesson.id}` : null

  useEffect(() => {
    setCurrentIndex(0)
    setHighestUnlockedIndex(0)
    setQuizState({})
    setAnswersLocked(false)
    setShowSubmitConfirm(false)
  }, [id])

  useEffect(() => {
    if (!quizStorageKey) return
    try {
      const raw = localStorage.getItem(quizStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        setQuizState(parsed)
      }
    } catch (err) {
      console.warn('读取测验记录失败', err)
    }
  }, [quizStorageKey])

  useEffect(() => {
    if (!lockStorageKey) return
    try {
      const locked = localStorage.getItem(lockStorageKey) === 'true'
      setAnswersLocked(locked)
    } catch (err) {
      console.warn('读取答案锁定状态失败', err)
      setAnswersLocked(false)
    }
  }, [lockStorageKey])

  useEffect(() => {
    if (!lesson || !user) return
    let cancelled = false
    api.get(`/progress/${lesson.id}`).then(res => {
      if (cancelled) return
      const idx = typeof res.data.currentIndex === 'number' ? res.data.currentIndex : -1
      const safeIndex = idx >= 0 ? Math.min(totalSegments - 1, idx) : 0
      setHighestUnlockedIndex(safeIndex)
      setCurrentIndex(safeIndex)
    }).catch(() => {
      if (!cancelled) {
        setHighestUnlockedIndex(0)
        setCurrentIndex(0)
      }
    })
    return () => { cancelled = true }
  }, [lesson?.id, user, totalSegments])

  const persistProgress = (index) => {
    if (!user || !lesson) return
    api.post(`/progress/${lesson.id}`, { index }).catch(err => {
      console.error('同步进度失败', err)
    })
  }

  const unlockUpTo = (targetIndex) => {
    if (!lesson) return
    setHighestUnlockedIndex(prev => {
      if (targetIndex <= prev) return prev
      const next = Math.min(targetIndex, totalSegments - 1)
      persistProgress(next)
      return next
    })
  }

  const goToSegment = (index) => {
    if (!lesson) return
    const clamped = Math.min(Math.max(index, 0), totalSegments - 1)
    if (clamped > highestUnlockedIndex) return
    if (clamped === currentIndex) return
    setCurrentIndex(clamped)
  }

  const goToNextSegment = () => {
    if (!lesson) return
    const nextIndex = currentIndex + 1
    if (nextIndex >= totalSegments) return
    unlockUpTo(nextIndex)
    setCurrentIndex(nextIndex)
  }

  const persistQuizState = (state) => {
    if (!quizStorageKey) return
    try {
      localStorage.setItem(quizStorageKey, JSON.stringify(state))
    } catch (err) {
      console.warn('保存测验记录失败', err)
    }
  }

  const navigateToSummary = () => {
    if (!lesson) return
    navigate(`/lesson/${lesson.id}/summary`, {
      state: {
        lessonId: lesson.id,
        highestUnlockedIndex: Math.min(highestUnlockedIndex, totalSegments - 1),
        quizState,
        answersLocked: true
      }
    })
  }

  const confirmSubmitAnswers = () => {
    if (!lesson) return
    if (totalSegments > 0) {
      persistProgress(totalSegments - 1)
    }
    persistQuizState(quizState)
    if (lockStorageKey) {
      try {
        localStorage.setItem(lockStorageKey, 'true')
      } catch (err) {
        console.warn('保存答案锁定状态失败', err)
      }
    }
    setAnswersLocked(true)
    setShowSubmitConfirm(false)
    navigateToSummary()
  }

  const goToSummary = () => {
    if (!lesson) return
    if (answersLocked) {
      navigateToSummary()
    } else {
      setShowSubmitConfirm(true)
    }
  }

  const cancelSubmitConfirm = () => {
    setShowSubmitConfirm(false)
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
  const clampedUnlockedIndex = Math.min(highestUnlockedIndex, segments.length - 1)
  const unlockedCount = segments.length > 0 ? clampedUnlockedIndex + 1 : 0
  const progressPercent = segments.length > 1
    ? Math.round((clampedUnlockedIndex / (segments.length - 1)) * 100)
    : 100
  const isLastSegment = segments.length > 0 && currentIndex === segments.length - 1

  const onSelectOption = (segmentId, optionKey, answer, explanation) => {
    if (answersLocked) return
    setQuizState(prev => {
      const next = {
        ...prev,
        [segmentId]: {
          selected: optionKey,
          isCorrect: optionKey === answer,
          explanation
        }
      }
      persistQuizState(next)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <FloatingAiTutorLink
        to="/ai-teacher"
        state={{ lessonId: lesson.id, lessonTitle: lesson.title }}
      />
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
        <p className="text-sm text-slate-500">
          学习进度：已解锁 {unlockedCount} / {segments.length} 小节（{progressPercent}%）
        </p>
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
              answersLocked={answersLocked}
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
              {isLastSegment
                ? '点击“前往课程总结”查看学习进度、测验解析与作业入口'
                : segment.type === 'quiz'
                  ? '选择答案后继续下一段，解析将在课程总结中查看'
                  : '阅读完本段内容后继续下一段'}
            </div>
            {isLastSegment ? (
              <button
                onClick={goToSummary}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                前往课程总结
              </button>
            ) : (
              <button
                onClick={goToNextSegment}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={currentIndex === segments.length - 1}
              >
                下一段
              </button>
            )}
          </div>
        </main>

        <aside className="space-y-6">
          <OutlineCard
            segments={segments}
            currentIndex={currentIndex}
            highestUnlockedIndex={highestUnlockedIndex}
            onJump={goToSegment}
            quizState={quizState}
            answersLocked={answersLocked}
          />
        </aside>
      </div>
      {showSubmitConfirm && (
        <SubmitConfirmModal
          onConfirm={confirmSubmitAnswers}
          onCancel={cancelSubmitConfirm}
        />
      )}
    </div>
  )
}

function SegmentContent({ segment, quizState, onSelectOption, answersLocked }) {
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
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                  checked
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-200'
                } ${answersLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <input
                  type="radio"
                  name={segment.id}
                  value={opt.key}
                  checked={checked}
                  onChange={() => onSelectOption(segment.id, opt.key, segment.answer, segment.explanation)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled={answersLocked}
                />
                <span className="text-slate-700 font-medium">{opt.key}</span>
                <span className="text-slate-700 flex-1">{opt.text}</span>
              </label>
            )
          })}
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {answersLocked
            ? '答案已锁定，课程总结中将展示解析与得分。'
            : '本节不会立即公布答案，完成课程并提交后可在总结页面查看解析。'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {segment.mediaPlaceholder && (
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

function OutlineCard({ segments, currentIndex, highestUnlockedIndex, onJump, quizState, answersLocked }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">课程大纲</h3>
      <ol className="space-y-2 text-sm text-slate-600">
        {segments.map((seg, idx) => {
          const isActive = idx === currentIndex
          const finished = idx < highestUnlockedIndex
          const locked = idx > highestUnlockedIndex
          const quizResult = seg.type === 'quiz' ? quizState?.[seg.id] : null
          return (
            <li key={seg.id}>
              <button
                onClick={() => onJump(idx)}
                disabled={locked}
                className={`w-full text-left rounded-xl px-3 py-2 transition border ${
                  locked
                    ? 'border-dashed border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : finished
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{seg.title}</span>
                  {seg.type === 'quiz' && quizResult?.selected && (
                    <span className="text-xs font-semibold text-slate-500">
                      {answersLocked ? '已锁定' : '已作答'}
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

function SubmitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">确认提交答案？</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            提交后所有选择题答案将锁定，无法在课程中修改。你可以在课程总结页面查看正确答案与解析。
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            继续检查
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            是的，确认提交
          </button>
        </div>
      </div>
    </div>
  )
}
