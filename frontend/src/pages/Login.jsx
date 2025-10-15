import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, login, register } = useAuth()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [mode])

  const handleChange = (field) => (evt) => {
    setForm(prev => ({ ...prev, [field]: evt.target.value }))
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('请填写邮箱和密码')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password, redirect)
      } else {
        await register({
          email: form.email,
          password: form.password,
          displayName: form.displayName || form.email.split('@')[0]
        }, redirect)
      }
    } catch (err) {
      const message = err?.response?.data?.error || '操作失败，请稍后再试'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">你已登录</h2>
        <p className="text-sm text-slate-500">欢迎回来，{user.displayName}！你可以直接从课程列表继续学习。</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">{mode === 'login' ? '登录账号' : '注册新账号'}</h2>
        <p className="text-sm text-slate-500">
          登录后可同步课程学习进度。{mode === 'login' ? '还没有账号？' : '已经注册过？'}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="ml-1 text-blue-600 hover:underline"
            type="button"
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600" htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@domain.com"
            autoComplete="email"
            required
          />
        </div>
        {mode === 'register' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="displayName">昵称</label>
            <input
              id="displayName"
              value={form.displayName}
              onChange={handleChange('displayName')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="课堂显示的昵称"
              autoComplete="nickname"
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600" htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="不少于 6 位"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? '处理中...' : mode === 'login' ? '登录' : '注册并登录'}
        </button>
      </form>
    </div>
  )
}
