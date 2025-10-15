import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { day1Lesson } from '../data/day1'

export default function Courses() {
  const { user, requireAuth } = useAuth()
  const [progressMap, setProgressMap] = useState({})
  const courses = useMemo(() => ([
    { id: 'nn', title: '神经网络入门', segments: day1Lesson.segments.length },
    { id: 'lr', title: '线性回归基础', segments: 8 }
  ]), [])

  useEffect(() => {
    if (!user) {
      setProgressMap({})
      return
    }

    let cancelled = false
    Promise.all(
      courses.map(course =>
        api.get(`/progress/${course.id}`).then(res => ({
          lessonId: course.id,
          currentIndex: typeof res.data.currentIndex === 'number' ? res.data.currentIndex : -1
        })).catch(() => ({
          lessonId: course.id,
          currentIndex: -1
        }))
      )
    ).then(results => {
      if (cancelled) return
      const nextMap = {}
      for (const item of results) {
        nextMap[item.lessonId] = item.currentIndex
      }
      setProgressMap(nextMap)
    })

    return () => {
      cancelled = true
    }
  }, [user, courses])

  const onEnterClick = (evt, lessonId) => {
    if (!requireAuth(`/lesson/${lessonId}`)) {
      evt.preventDefault()
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map(course => {
        const currentIndex = progressMap[course.id] ?? -1
        const completedSegments = Math.max(0, currentIndex + 1)
        const ratio = course.segments ? Math.min(1, completedSegments / course.segments) : 0
        const percent = Math.round(ratio * 100)
        const label = percent > 0 ? `已完成 ${percent}%` : '尚未开始'

        return (
          <div key={course.id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <Link
              to={`/lesson/${course.id}`}
              onClick={evt => onEnterClick(evt, course.id)}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {percent > 0 ? '继续学习' : '进入学习'}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
