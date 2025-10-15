import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Courses from './pages/Courses'
import Lesson from './pages/Lesson'
import Assignment from './pages/Assignment'
import Report from './pages/Report'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useAuth } from './hooks/useAuth'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-6 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Courses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lesson/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/assignment/:id" element={<Assignment />} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="text-center">
              <p className="text-lg">页面不存在</p>
              <Link className="text-blue-600" to="/">返回首页</Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading, requireAuth } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      requireAuth(location.pathname)
    }
  }, [loading, user, location.pathname])

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        正在加载用户信息...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-xl font-semibold text-slate-700">该内容需要登录后访问。</p>
        <p className="text-sm text-slate-500">我们已为你准备好跳转，请完成登录后再返回学习。</p>
        <Link
          to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          前往登录
        </Link>
      </div>
    )
  }

  return children
}
