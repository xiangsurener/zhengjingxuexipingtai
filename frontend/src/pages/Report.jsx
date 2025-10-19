import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Report() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/report/summary').then(res => setData(res.data))
  }, [])

  if (!data) {
    return <p className="text-center text-slate-500">加载中...</p>
  }

  const lessonEntries = Object.entries(data.scoresByLesson ?? {})
  const overallScore = data.overallScore ?? lessonEntries.reduce((total, [, score]) => total + (score?.totalScore ?? 0), 0)
  const totalCourses = lessonEntries.length
  const fullTestScore = totalCourses * 20
  const fullAssignmentScore = totalCourses * 80
  const fullOverallScore = totalCourses * 100
  const hasCourses = totalCourses > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">学习报告</h1>
        <p className="text-sm text-slate-500">测试成绩（20 分）与作业成绩（80 分）相加，构成课程总分（100 分）。</p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">累积经验值</p>
            <p className="text-xl font-semibold text-slate-900">{data.totalXp}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">平均正确率</p>
            <p className="text-xl font-semibold text-slate-900">{Math.round((data.avgAccuracy ?? 0) * 100)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-500">全部课程总分</p>
            <p className="text-xl font-semibold text-blue-600">
              {hasCourses ? `${overallScore} / ${fullOverallScore}` : '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span>
            测试合计：{data.totalTestScore ?? 0}
            {hasCourses ? ` / ${fullTestScore}` : ' / —'}
          </span>
          <span>
            作业合计：{data.totalAssignmentScore ?? 0}
            {hasCourses ? ` / ${fullAssignmentScore}` : ' / —'}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">各课程得分</h2>
        <div className="space-y-3">
          {lessonEntries.length === 0 && (
            <p className="text-sm text-slate-500">尚无课程成绩，快去完成学习与作业吧！</p>
          )}
          {lessonEntries.map(([title, score]) => (
            <article key={title} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">{score?.totalScore ?? 0} / 100</span>
              </div>
              <p className="text-sm text-slate-600">
                测试成绩：<span className="font-medium text-slate-800">{score?.testScore ?? 0} / 20</span>
                <span className="mx-2 text-slate-400">·</span>
                作业成绩：<span className="font-medium text-slate-800">{score?.assignmentScore ?? 0} / 80</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
