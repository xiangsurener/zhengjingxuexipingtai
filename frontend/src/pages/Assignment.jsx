import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../services/api'

const BASE_TEMPLATE = `# 注意：
# 1. 平台会将 train_df（DataFrame）传入 build_model，请勿自行读取本地 CSV。
# 2. 不要导入 subprocess / requests / socket 等网络或进程模块，避免被判定为违规。
# 3. 保持函数签名不变，按需返回可预测的模型或实现 predict 函数。

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression

# 必须实现：build_model(train_df)
def build_model(train_df: pd.DataFrame):
    features = train_df.drop(columns=["Survived"])
    target = train_df["Survived"]

    numeric_features = ["Age", "Fare", "SibSp", "Parch"]
    categorical_features = ["Pclass", "Sex", "Embarked", "Ticket", "Cabin", "Name"]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
    )

    classifier = LogisticRegression(max_iter=400, random_state=2024)
    model = Pipeline(steps=[
        ("prep", preprocessor),
        ("clf", classifier),
    ])

    model.fit(features, target)
    return model


# 可选：predict(model, features_df)，若缺省则要求 build_model 返回的对象实现 predict
def predict(model, features_df: pd.DataFrame):
    return model.predict(features_df)
`

export default function Assignment() {
  const { id } = useParams()
  const [code, setCode] = useState(BASE_TEMPLATE)
  const [isGrading, setIsGrading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const grade = async () => {
    setIsGrading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await api.post('/assignment/grade', {
        assignmentId: id,
        code
      })
      setResult(data)
    } catch (err) {
      const message = err.response?.data?.error || '自动评分失败，请稍后再试。'
      setError(message)
    } finally {
      setIsGrading(false)
    }
  }

  const resetCode = () => {
    setCode(BASE_TEMPLATE)
    setResult(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-slate-500">自动评分 · 编程作业</p>
        <h1 className="text-3xl font-bold text-slate-900">课程 {id} · 泰坦尼克号生存预测</h1>
        <p className="text-slate-600 leading-relaxed">
          请在下方粘贴完整的 Python 代码，我们会在服务器端调用你的 <code>build_model</code> /
          <code>predict</code> 函数，使用隐藏验证集自动评分。评分构成：可运行 20 分、合规 10 分、隐藏集效果 50 分。
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">作业要求</h2>
        <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
          <li>从训练数据 <code>train.csv</code> 学习模型，代码需实现 <code>build_model(train_df)</code>，返回拥有 <code>predict</code> 方法的对象。</li>
          <li>可选地实现 <code>predict(model, features_df)</code>，若不提供则使用模型自身的 <code>predict</code>。</li>
          <li>评分时我们会隐藏一部分数据作为验证集，不会提供对应的标签，请避免硬编码答案。</li>
          <li>若暂时无法改写为函数，可提交可直接运行的脚本，评分器会进入「脚本兼容模式」，从 <code>stdout</code> 中解析 <code>Accuracy</code> 估分。</li>
          <li>禁止使用网络/进程相关模块（如 <code>subprocess</code>、<code>requests</code>、<code>socket</code>），否则安全合规项计 0 分。</li>
          <li>建议控制运行时间在 20 秒内；请在需要的库（例如 pandas、scikit-learn）本地调试后再提交。</li>
        </ul>
        <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-600">
          数据下载：<a className="text-blue-600 hover:text-blue-500" href="/datasets/titanic/train.csv" download>点击获取 train.csv</a>。
          该文件也可以直接通过 <code>fetch('/datasets/titanic/train.csv')</code> 获取用于前端展示。
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">代码编辑区</h2>
            <p className="text-sm text-slate-500 mt-1">可直接使用右侧模板，也可以粘贴你自己的实现。</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetCode}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              恢复模板
            </button>
            <button
              type="button"
              onClick={grade}
              disabled={isGrading}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGrading ? '评分中...' : '提交自动评分'}
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          className="font-mono w-full min-h-[400px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}
      </section>

      {result && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">评分结果</h2>
              <p className="text-sm text-slate-500">
                {result.mode === 'script' ? '脚本兼容模式' : '标准函数模式'} · 总分上限 80 分，本次得分 {result.totalScore ?? 0} 分。
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-2 text-blue-700 text-sm font-medium">
              总分 {result.totalScore ?? 0} / 80
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
            <ScoreCard title="可运行" score={result.scores?.run ?? 0} total={20} />
            <ScoreCard title="安全合规" score={result.scores?.compliance ?? 0} total={10} />
            <ScoreCard title="隐藏集效果" score={result.scores?.effect ?? 0} total={50} />
          </div>
          {typeof result.metrics?.accuracy === 'number' && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              隐藏集准确率：{(result.metrics.accuracy * 100).toFixed(1)}%
            </div>
          )}
          {typeof result.metrics?.parsedAccuracy === 'number' && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              兼容模式解析到 Accuracy ≈ {(result.metrics.parsedAccuracy * 100).toFixed(1)}%
            </div>
          )}
          <div className="space-y-2 text-sm text-slate-600">
            {result.messages?.map((msg, idx) => (
              <p key={idx}>• {msg}</p>
            ))}
            {(!result.messages || result.messages.length === 0) && (
              <p>评分完成，未提供额外提示。</p>
            )}
          </div>
          <details className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <summary className="cursor-pointer select-none text-slate-700 font-medium">查看执行日志</summary>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs uppercase text-slate-400 tracking-wide">stdout</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white px-3 py-2 text-xs text-slate-700 border border-slate-200">
                  {result.logs?.stdout ? result.logs.stdout : '（无输出）'}
                </pre>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 tracking-wide">stderr</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white px-3 py-2 text-xs text-slate-700 border border-slate-200">
                  {result.logs?.stderr ? result.logs.stderr : '（无错误输出）'}
                </pre>
              </div>
            </div>
          </details>
        </section>
      )}
    </div>
  )
}

function ScoreCard({ title, score, total }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-lg font-semibold text-slate-900 mt-1">{score} / {total}</p>
    </div>
  )
}
