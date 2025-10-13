import { Link } from 'react-router-dom'

export default function Courses() {
  const list = [
    { id: 'nn', title: '神经网络入门', progress: 0.1 },
    { id: 'lr', title: '线性回归基础', progress: 0.0 }
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map(c => (
        <div key={c.id} className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold">{c.title}</h3>
          <div className="mt-2 h-2 bg-slate-200 rounded">
            <div className="h-2 bg-blue-500 rounded" style={{ width: `${c.progress * 100}%` }} />
          </div>
          <Link to={`/lesson/${c.id}`} className="mt-4 inline-block text-sm text-blue-600">
            进入学习
          </Link>
        </div>
      ))}
    </div>
  )
}