import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { day1Lesson } from '../data/day1'

const lessons = {
  nn: day1Lesson
}

const SCORE_PER_QUIZ = 10
const QUIZ_STORAGE_PREFIX = 'lp.lesson.quizState.'
const QUIZ_LOCK_PREFIX = 'lp.lesson.quizLocked.'

export default function CourseSummary() {
  const { id } = useParams()
  const location = useLocation()
  const lesson = lessons[id]
  const [progress, setProgress] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [quizState, setQuizState] = useState(location.state?.quizState ?? {})
  const [answersLocked, setAnswersLocked] = useState(() => Boolean(location.state?.answersLocked))
  const quizStorageKey = lesson ? `${QUIZ_STORAGE_PREFIX}${lesson.id}` : null
  const lockStorageKey = lesson ? `${QUIZ_LOCK_PREFIX}${lesson.id}` : null

  useEffect(() => {
    if (!quizStorageKey) return
    if (location.state?.quizState) return
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
  }, [quizStorageKey, location.state])

  useEffect(() => {
    if (!lockStorageKey) return
    try {
      const locked = localStorage.getItem(lockStorageKey) === 'true'
      setAnswersLocked(locked)
    } catch (err) {
      console.warn('读取答案锁定状态失败', err)
    }
  }, [lockStorageKey])

  useEffect(() => {
    if (!lesson) return
    let cancelled = false
    setLoadingProgress(true)
    api.get(`/progress/${lesson.id}`).then(res => {
      if (cancelled) return
      setProgress(res.data)
    }).catch(() => {
      if (!cancelled) {
        setProgress(null)
      }
    }).finally(() => {
      if (!cancelled) {
        setLoadingProgress(false)
      }
    })
    return () => { cancelled = true }
  }, [lesson?.id])

  const summary = useMemo(() => {
    if (!lesson) {
      return null
    }
    const totalSegments = lesson.segments.length
    const fallbackIndex = location.state?.highestUnlockedIndex
    let resolvedIndex = typeof progress?.currentIndex === 'number'
      ? progress.currentIndex
      : typeof fallbackIndex === 'number'
        ? fallbackIndex
        : totalSegments > 0
          ? totalSegments - 1
          : -1
    if (totalSegments > 0) {
      resolvedIndex = Math.min(Math.max(resolvedIndex, 0), totalSegments - 1)
    } else {
      resolvedIndex = -1
    }
    const completedSegments = resolvedIndex >= 0 ? resolvedIndex + 1 : 0
    const progressPercent = totalSegments > 0
      ? Math.round((completedSegments / totalSegments) * 100)
      : 0
    const quizSegments = lesson.segments.filter(seg => seg.type === 'quiz')
    const correctCount = quizSegments.reduce((acc, seg) => {
      return acc + (quizState?.[seg.id]?.isCorrect ? 1 : 0)
    }, 0)
    const totalScore = correctCount * SCORE_PER_QUIZ
    const maxScore = quizSegments.length * SCORE_PER_QUIZ
    return {
      totalSegments,
      completedSegments,
      remainingSegments: Math.max(totalSegments - completedSegments, 0),
      progressPercent,
      quizSegments,
      correctCount,
      totalScore,
      maxScore
    }
  }, [lesson, progress, quizState, location.state])

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">课程未找到</h1>
        <p className="text-slate-500">课程 ID “{id}” 暂无总结页面。</p>
        <Link className="text-blue-600 hover:text-blue-500" to="/">返回课程列表</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-sm text-slate-500 uppercase tracking-wide">课程总结</p>
        <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
        <p className="text-slate-600">
          恭喜完成课程！下面整理了本节课的学习进度、测验得分与参考答案，并提供后续作业入口。
        </p>
      </header>

      {!answersLocked && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          当前记录尚未锁定，如需最终成绩请返回课程页面点击“前往课程总结”并确认提交。
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <ProgressDonut percent={summary?.progressPercent ?? 0} loading={loadingProgress} />
            <div className="space-y-3 text-slate-700">
              <h2 className="text-xl font-semibold text-slate-900">学习进度概览</h2>
              <p>
                本课程共 {summary?.totalSegments ?? 0} 小节，你已完成 {summary?.completedSegments ?? 0} 小节，
                剩余 {summary?.remainingSegments ?? 0} 小节复习巩固。
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>最新同步时间：{progress?.updatedAt ? new Date(progress.updatedAt).toLocaleString() : '—'}</li>
                <li>进度百分比：{summary?.progressPercent ?? 0}%</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">测验成绩</h2>
          <p className="text-4xl font-bold text-blue-600">
            {summary?.totalScore ?? 0} <span className="text-base text-slate-500">/ {summary?.maxScore ?? 0}</span>
          </p>
          <p className="text-sm text-slate-500">
            共 {summary?.quizSegments.length ?? 0} 道课堂小测，答对 {summary?.correctCount ?? 0} 题。
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">课堂问题答案解析</h2>
          <p className="text-sm text-slate-500 mt-1">
            可回顾每道题的正确答案与讲解，找出需要强化的知识点。
          </p>
        </div>
        <div className="space-y-4">
          {summary?.quizSegments.map(seg => {
            const result = quizState?.[seg.id]
            const selectedLabel = result?.selected
            const correct = result?.isCorrect
            return (
              <div key={seg.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">课堂练习</p>
                    <h3 className="text-lg font-semibold text-slate-900">{seg.title}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                      correct
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedLabel
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {correct ? '✔ 回答正确' : selectedLabel ? '提示：再巩固一下' : '未作答'}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-700">你的选择：</span>{selectedLabel ?? '尚未作答'}</p>
                  <p><span className="font-medium text-slate-700">参考答案：</span>{seg.answer}</p>
                  <p className="leading-relaxed">
                    <span className="font-medium text-slate-700">解析：</span>
                    {seg.explanation}
                  </p>
                </div>
              </div>
            )
          })}
          {summary?.quizSegments.length === 0 && (
            <p className="text-sm text-slate-500">本课程暂无测验。</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">下一步：完成课后作业</h2>
          <p className="text-sm text-slate-600 mt-1">
            点击下方按钮前往“作业提交界面”，上传你的实践成果，巩固本节课知识。
          </p>
        </div>
        <Link
          to={`/assignment/${lesson.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          前往作业
        </Link>
      </section>

      <div className="text-sm text-slate-500">
        想要复习或重新学习？返回<Link to={`/lesson/${lesson.id}`} className="text-blue-600 hover:text-blue-500 ml-1">课程正文</Link>。
      </div>
    </div>
  )
}

function ProgressDonut({ percent, loading }) {
  const clamped = Number.isFinite(percent) ? Math.min(Math.max(percent, 0), 100) : 0
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth="14"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-blue-500 transition-all"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900">{loading ? '...' : `${clamped}%`}</span>
        <span className="text-xs text-slate-500 mt-1">完成度</span>
      </div>
    </div>
  )
}
