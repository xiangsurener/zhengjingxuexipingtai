import { Routes, Route, Link } from 'react-router-dom'
import Courses from './pages/Courses'
import Lesson from './pages/Lesson'
import Assignment from './pages/Assignment'
import Report from './pages/Report'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-6 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Courses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/assignment/:id" element={<Assignment />} />
          <Route path="/report" element={<Report />} />
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