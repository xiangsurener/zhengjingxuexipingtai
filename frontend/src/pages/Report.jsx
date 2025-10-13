import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Report() {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.get('/report/summary').then(res => setData(res.data))
  }, [])
  if (!data) return <p>加载中...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold mb-2">学习报告</h2>
      <div className="rounded bg-white p-4 shadow">
        <p>总经验值：{data.totalXp}</p>
        <p>平均正确率：{Math.round(data.avgAccuracy * 100)}%</p>
        <div className="mt-2">
          <p className="font-semibold mb-1">各课程得分：</p>
          <ul className="list-disc pl-6">
            {Object.entries(data.scoresByLesson).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}