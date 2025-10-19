import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'ai_teacher_floating_position'

export default function FloatingAiTutorLink({
  to = '/ai-teacher',
  state,
  initialPosition = { x: 32, y: 160 }
}) {
  const [position, setPosition] = useState(initialPosition)
  const containerRef = useRef(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          setPosition(parsed)
        }
      }
    } catch {
      // 忽略持久化失败
    }
  }, [])

  const clampPosition = useCallback((next) => {
    if (typeof window === 'undefined') return next
    const { innerWidth, innerHeight } = window
    const width = containerRef.current?.offsetWidth ?? 0
    const height = containerRef.current?.offsetHeight ?? 0
    const margin = 12
    return {
      x: Math.min(Math.max(next.x, margin), innerWidth - width - margin),
      y: Math.min(Math.max(next.y, margin), innerHeight - height - margin)
    }
  }, [])

  const storePosition = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // 忽略持久化失败
    }
  }, [])

  const handlePointerMove = useCallback((event) => {
    if (!draggingRef.current) return
    const nextPosition = {
      x: event.clientX - dragOffsetRef.current.x,
      y: event.clientY - dragOffsetRef.current.y
    }
    setPosition(clampPosition(nextPosition))
  }, [clampPosition])

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    setPosition(prev => {
      const clamped = clampPosition(prev)
      storePosition(clamped)
      return clamped
    })
  }, [clampPosition, handlePointerMove, storePosition])

  const handlePointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    draggingRef.current = true
    dragOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [handlePointerMove, handlePointerUp, position.x, position.y])

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  return (
    <div
      ref={containerRef}
      className="fixed z-50 max-w-xs"
      style={{ left: position.x, top: position.y }}
    >
      <div className="rounded-2xl border border-blue-200 bg-white shadow-xl shadow-blue-100/40">
        <div
          onPointerDown={handlePointerDown}
          className="cursor-move select-none rounded-t-2xl bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          AI 教师问答 · 拖动我
        </div>
        <div className="space-y-3 px-4 py-4 text-sm text-slate-600">
          <p className="leading-relaxed">
            前往AI 教师处提问
          </p>
          <Link
            to={to}
            state={state}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            前往问答页面
          </Link>
        </div>
      </div>
    </div>
  )
}
