import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('lp.authToken')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore storage errors
  }
  return config
})
