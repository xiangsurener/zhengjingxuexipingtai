import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'lp.authToken'
const REDIRECT_KEY = 'lp.redirectAfterLogin'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => readToken())
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    api.get('/auth/me')
      .then(res => {
        if (!cancelled) {
          setUser(res.data.user)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          writeToken(null)
          setToken(null)
          setUser(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleLoginSuccess = (tokenValue, userData, redirectPath) => {
    writeToken(tokenValue)
    setToken(tokenValue)
    setUser(userData)
    setPrompt(null)
    const redirect = redirectPath || readPendingRedirect() || '/'
    clearPendingRedirect()
    navigate(redirect, { replace: true })
  }

  const readPendingRedirect = () => {
    try {
      return localStorage.getItem(REDIRECT_KEY)
    } catch {
      return null
    }
  }

  const clearPendingRedirect = () => {
    try {
      localStorage.removeItem(REDIRECT_KEY)
    } catch {
      // ignore
    }
  }

  const storeRedirect = (path) => {
    try {
      if (path) {
        localStorage.setItem(REDIRECT_KEY, path)
      } else {
        localStorage.removeItem(REDIRECT_KEY)
      }
    } catch {
      // ignore
    }
  }

  const login = async (email, password, redirectPath) => {
    const { data } = await api.post('/auth/login', { email, password })
    handleLoginSuccess(data.token, data.user, redirectPath)
    return data.user
  }

  const register = async (payload, redirectPath) => {
    const { email, password, displayName } = payload
    const { data } = await api.post('/auth/register', { email, password, displayName })
    handleLoginSuccess(data.token, data.user, redirectPath)
    return data.user
  }

  const logout = () => {
    writeToken(null)
    clearPendingRedirect()
    setToken(null)
    setUser(null)
    navigate('/', { replace: true })
  }

  const requireAuth = (redirectPath) => {
    if (user) return true
    const target = redirectPath || location.pathname
    setPrompt({ redirect: target })
    storeRedirect(target)
    navigate(`/login?redirect=${encodeURIComponent(target)}`)
    return false
  }

  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    requireAuth,
    prompt,
    setPrompt
  }), [user, token, loading, prompt])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <LoginPrompt prompt={prompt} onClose={() => setPrompt(null)} />
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

function LoginPrompt({ prompt, onClose }) {
  if (!prompt) return null
  const redirect = prompt.redirect || '/login'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-w-sm w-full rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">请先登录</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          登录后即可同步学习进度，并继续浏览该内容。
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
            onClick={onClose}
          >
            前往登录
          </a>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
            onClick={onClose}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
