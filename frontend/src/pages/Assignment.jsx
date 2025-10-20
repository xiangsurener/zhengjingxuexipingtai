import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'

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

// 针对 dl（深度学习进阶）作业的红酒回归模板，基于 backend/eval_assets/redwine/validation&early_stopping.py
// 优先使用 PyTorch 实现（包含归一化、DataLoader、神经网络与早停策略、以 MAE 作为验证指标）
// 如果运行环境没有 torch，则自动回退到 sklearn 的 RandomForest 作为兼容实现
const REDWINE_TEMPLATE = `# 红酒质量预测（深度学习样例，build_model(train_df) 返回含 predict 的模型）
import pandas as pd
import numpy as np

def _sklearn_fallback(train_df):
    # 兼容性回退：若没有 torch，可使用随机森林快速构建可预测模型
    from sklearn.pipeline import Pipeline
    from sklearn.impute import SimpleImputer
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestRegressor
    X = train_df.drop(columns=['quality'])
    y = train_df['quality']
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('model', RandomForestRegressor(n_estimators=200, random_state=2024))
    ])
    pipeline.fit(X[num_cols], y)
    class SKModel:
        def __init__(self, pipe, cols):
            self.pipe = pipe
            self.cols = cols
        def predict(self, features_df):
            return self.pipe.predict(features_df[self.cols])
    return SKModel(pipeline, num_cols)

def build_model(train_df: pd.DataFrame):
    """返回一个具有 predict(features_df) 方法的模型对象。
    实现思路参考 validation&early_stopping.py：数值列归一化 -> 划分训练/验证 -> PyTorch 模型训练（MAE）带早停。
    在无法导入 torch 时自动退化为 sklearn 随机森林实现以保证可运行性。
    """
    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
        from torch.utils.data import DataLoader, TensorDataset
    except Exception:
        return _sklearn_fallback(train_df)

    # 只使用数值列（与后端验证脚本对齐）
    df = train_df.copy()
    if 'quality' not in df.columns:
        raise ValueError('train_df must contain a "quality" column as target')
    y = df['quality'].astype(float).values
    X = df.drop(columns=['quality'])
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    if len(num_cols) == 0:
        return _sklearn_fallback(train_df)

    X_num = X[num_cols].fillna(X[num_cols].median())
    # 简单 min-max 归一化（与后端脚本一致的思想）
    min_ = X_num.min()
    max_ = X_num.max()
    X_scaled = (X_num - min_) / (max_ - min_ + 1e-9)

    X_arr = X_scaled.values.astype(np.float32)
    y_arr = y.astype(np.float32).reshape(-1, 1)

    # 划分训练/验证（固定随机种子以提高可复现性）
    rng = np.random.RandomState(2024)
    idx = np.arange(len(X_arr))
    rng.shuffle(idx)
    split = int(len(idx) * 0.7) if len(idx) > 10 else int(len(idx) * 0.8)
    train_idx = idx[:split]
    valid_idx = idx[split:]

    X_train = torch.from_numpy(X_arr[train_idx])
    y_train = torch.from_numpy(y_arr[train_idx])
    X_valid = torch.from_numpy(X_arr[valid_idx])
    y_valid = torch.from_numpy(y_arr[valid_idx])

    batch_size = 64
    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=batch_size, shuffle=True)
    valid_loader = DataLoader(TensorDataset(X_valid, y_valid), batch_size=batch_size, shuffle=False)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # 简单三层 MLP（与 validation 脚本思路相近，但更小以适配评分环境）
    class Net(nn.Module):
        def __init__(self, in_dim):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(in_dim, 256),
                nn.ReLU(),
                nn.Linear(256, 128),
                nn.ReLU(),
                nn.Linear(128, 1)
            )
        def forward(self, x):
            return self.net(x)

    model = Net(len(num_cols)).to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.L1Loss()  # MAE，与后端验证以 MAE 为准

    # 早停实现（小范围 patience）
    best_state = None
    best_val = float('inf')
    patience = 15
    counter = 0
    epochs = 200

    for epoch in range(epochs):
        model.train()
        train_losses = []
        for xb, yb in train_loader:
            xb = xb.to(device)
            yb = yb.to(device)
            optimizer.zero_grad()
            out = model(xb)
            loss = criterion(out, yb)
            loss.backward()
            optimizer.step()
            train_losses.append(loss.item())

        model.eval()
        val_losses = []
        with torch.no_grad():
            for xb, yb in valid_loader:
                xb = xb.to(device)
                yb = yb.to(device)
                out = model(xb)
                loss = criterion(out, yb)
                val_losses.append(loss.item())
        val_loss = float(np.mean(val_losses)) if val_losses else float(np.mean(train_losses))

        # 早停逻辑
        if val_loss + 1e-6 < best_val:
            best_val = val_loss
            best_state = {k: v.cpu() for k, v in model.state_dict().items()}
            counter = 0
        else:
            counter += 1
            if counter >= patience:
                break

    # 恢复最佳权重
    if best_state is not None:
        model.load_state_dict(best_state)

    # 包装为具有 predict 方法的对象（predict 接受 pandas DataFrame）
    class TorchWrapper:
        def __init__(self, model, cols, min_v, max_v, device):
            self.model = model
            self.cols = cols
            self.min_v = np.array(min_v, dtype=np.float32)
            self.max_v = np.array(max_v, dtype=np.float32)
            self.device = device
        def predict(self, features_df: pd.DataFrame):
            X = features_df[self.cols].copy().fillna(features_df[self.cols].median())
            X = (X - self.min_v) / (self.max_v - self.min_v + 1e-9)
            arr = X.values.astype(np.float32)
            import torch
            with torch.no_grad():
                t = torch.from_numpy(arr).to(self.device)
                out = self.model(t).cpu().numpy().reshape(-1)
            return out

    return TorchWrapper(model, num_cols, min_.values, max_.values, device)

def predict(model, features_df):
    # 若 build_model 返回的是 sklearn 风格 pipeline 或 wrapper，直接调用 predict
    return model.predict(features_df)
`

const ASSIGN_PREFIX = 'lp.assignment.submitted.'

export default function Assignment() {
  const { id } = useParams()
  const { user } = useAuth()
  // 根据作业 id 选择默认模板与数据文件（nn 使用原模板，dl 使用 redwine 模板）
  const defaultTemplate = id === 'dl' ? REDWINE_TEMPLATE : BASE_TEMPLATE
  const datasetLink = id === 'dl' ? '/datasets/redwine/red-wine.csv' : '/datasets/titanic/train.csv'
  const datasetFilename = id === 'dl' ? 'red-wine.csv' : 'train.csv'
  const [code, setCode] = useState(defaultTemplate)
  const [isGrading, setIsGrading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const userKeyPart = user ? (user.id || user.email || user.username || String(user)) : 'guest'
  const assignmentStorageKey = id ? `${ASSIGN_PREFIX}${userKeyPart}.${id}` : null

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
    setCode(defaultTemplate)
    setResult(null)
    setError(null)
  }

  // 提交后保存状态到 localStorage
  const submitted = assignmentStorageKey ? (localStorage.getItem(assignmentStorageKey) === 'true') : false
  const handleSubmit = () => {
    if (assignmentStorageKey) {
      try {
        localStorage.setItem(assignmentStorageKey, 'true')
      } catch (e) {
        console.error('Failed to save to localStorage', e)
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-slate-500">自动评分 · 编程作业</p>
        {/* 动态标题 & 简要说明（针对 dl 展示红酒回归说明） */}
        <h1 className="text-3xl font-bold text-slate-900">
          课程 {id} · {id === 'dl' ? '红酒质量预测（回归）' : '泰坦尼克号生存预测'}
        </h1>
        <p className="text-slate-600 leading-relaxed">
          {id === 'dl'
            ? '请在下方粘贴完整的 Python 代码：实现 build_model(train_df)（train_df 包含 quality 列作为目标）。模板已采用 PyTorch 训练 + 早停（EarlyStopping）并以 MAE 作为验证指标，后端评估脚本为 backend/eval_assets/redwine/validation&early_stopping.py。若评分环境未安装 torch，模板会自动回退到 sklearn RandomForest 以保证可运行性。'
            : '请在下方粘贴完整的 Python 代码，我们会在服务器端调用你的 ' }
         {id !== 'dl' && (<><code>build_model</code> / <code>predict</code> 函数，使用隐藏验证集自动评分。评分构成：可运行 20 分、合规 10 分、隐藏集效果 50 分。</>)}
       </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">作业要求</h2>
        <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
          <li>
            {id === 'dl'
              ? <>从训练数据 <code>{datasetFilename}</code> 学习模型，代码需实现 <code>build_model(train_df)</code>，train_df 含目标列 <code>quality</code>，函数应返回拥有 <code>predict</code> 方法的对象（回归任务）。</>
              : <>从训练数据 <code>{datasetFilename}</code> 学习模型，代码需实现 <code>build_model(train_df)</code>，返回拥有 <code>predict</code> 方法的对象。</>}
          </li>
          <li>可选地实现 <code>predict(model, features_df)</code>，若不提供则使用模型自身的 <code>predict</code>。</li>
          <li>评分时我们会隐藏一部分数据作为验证集，不会提供对应的标签，请避免硬编码答案。对于回归作业（dl），评估以验证集损失/MAE 为主。</li>
          <li>若暂时无法改写为函数，可提交可直接运行的脚本，评分器会进入「脚本兼容模式」，从 <code>stdout</code> 中解析 <code>Accuracy</code> 估分。</li>
          <li>禁止使用网络/进程相关模块（如 <code>subprocess</code>、<code>requests</code>、<code>socket</code>），否则安全合规项计 0 分。</li>
          <li>建议控制运行时间在 20 秒内；请在需要的库（例如 pandas、scikit-learn）本地调试后再提交。</li>
        </ul>
        <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-600">
          数据下载：<a className="text-blue-600 hover:text-blue-500" href={datasetLink} download>点击获取 {datasetFilename}</a>。
          {id === 'dl' && <div className="text-xs text-slate-400 mt-2">提示：后端评估参考路径： backend/eval_assets/redwine/validation&early_stopping.py</div>}
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
