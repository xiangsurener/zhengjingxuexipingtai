import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-6">
        <Link to="/" className="font-bold">学习平台</Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/">课程</Link>
          <Link to="/report">学习报告</Link>
          <Link to="/login">登录</Link>
        </nav>
      </div>
    </header>
  )
}