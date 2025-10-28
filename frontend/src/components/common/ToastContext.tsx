import { createContext, useContext, useState, useCallback } from 'react'
import type { ToastProps, ToastContextType, ToastProviderProps } from './types'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback(
    (
      message: string,
      options?: {
        variant?: ToastProps['variant']
        duration?: number
        action?: ToastProps['action']
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const duration = options?.duration ?? 3000

      const newToast: ToastProps = {
        id,
        message,
        variant: options?.variant ?? 'info',
        duration,
        onClose: () => removeToast(id),
        action: options?.action,
      }

      setToasts((prev) => [...prev, newToast])

      // 자동으로 토스트 제거 (0보다 큰 경우만)
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
