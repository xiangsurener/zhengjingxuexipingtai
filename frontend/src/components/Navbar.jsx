import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout, requireAuth } = useAuth()
  const navigate = useNavigate()

  const handleReportClick = (evt) => {
    if (!user) {
      evt.preventDefault()
      requireAuth('/report')
    }
  }

  const handleLogout = () => {
    logout()
  }

  const goLogin = () => {
    navigate('/login')
  }

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="text-lg font-bold text-slate-900">学习平台</Link>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-blue-600">课程</Link>
          <Link to="/report" onClick={handleReportClick} className="hover:text-blue-600">
            学习报告
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-500">你好，{user.displayName}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-100"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={goLogin}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-500"
            >
              登录 / 注册
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
