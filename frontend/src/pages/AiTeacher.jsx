import { Link, useLocation } from 'react-router-dom'
import AiTeacherPanel from '../components/AiTeacherPanel'

export default function AiTeacher() {
  const location = useLocation()
  const state = location.state ?? {}
  const lessonTitle = state.lessonTitle || 'AI 教师问答'
  const lessonId = state.lessonId || 'ai-teacher-standalone'
  const fromLessonId = state.lessonId

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">AI 教师</p>
        <h1 className="text-3xl font-bold text-slate-900">AI 教师问答</h1>
        {state.lessonTitle ? (
          <p className="text-sm text-slate-500">
            当前聚焦课程：
            <span className="text-slate-700 font-medium">{state.lessonTitle}</span>
            {fromLessonId && (
              <>
                <span className="mx-1 text-slate-300">|</span>
                <Link
                  to={`/lesson/${fromLessonId}`}
                  className="text-blue-600 hover:text-blue-500"
                >
                  返回课程
                </Link>
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            随时向 AI 教师咨询你学习中遇到的问题。
          </p>
        )}
        <p className="text-slate-600 max-w-3xl">
          将学习中的困惑、当前章节或你希望深入理解的概念描述给 AI 教师。提出越具体的问题，
          AI 教师给出的建议就越贴合课程内容。
        </p>
      </div>

      <AiTeacherPanel
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        conversationHeight={360}
      />
    </div>
  )
}
