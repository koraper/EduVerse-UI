import { useEffect } from 'react'
import type { ToastProps } from './types'

const Toast = ({ message, variant = 'info', duration, onClose, action }: ToastProps) => {
  // 자동 닫기 타이머 설정 (duration이 명시적으로 설정된 경우)
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  // 배리언트별 스타일
  const variantStyles = {
    success: {
      bg: 'bg-success-50 border-success-200',
      icon: '✓',
      iconColor: 'text-success-600',
      textColor: 'text-success-800',
      buttonHover: 'hover:bg-success-100',
    },
    error: {
      bg: 'bg-error-50 border-error-200',
      icon: '✕',
      iconColor: 'text-error-600',
      textColor: 'text-error-800',
      buttonHover: 'hover:bg-error-100',
    },
    warning: {
      bg: 'bg-warning-50 border-warning-200',
      icon: '⚠',
      iconColor: 'text-warning-600',
      textColor: 'text-warning-800',
      buttonHover: 'hover:bg-warning-100',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      buttonHover: 'hover:bg-blue-100',
    },
  }

  const style = variantStyles[variant]

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        ${style.bg}
        shadow-lg animate-in fade-in slide-in-from-top-2 duration-300
        min-w-[300px] max-w-[500px]
      `}
      role="alert"
      aria-live="polite"
    >
      {/* 아이콘 */}
      <div className={`flex-shrink-0 text-lg font-bold ${style.iconColor}`}>
        {style.icon}
      </div>

      {/* 메시지 */}
      <div className={`flex-1 ${style.textColor} text-sm font-medium`}>
        {message}
      </div>

      {/* 액션 버튼 */}
      {action && (
        <button
          onClick={() => {
            action.onClick()
            onClose?.()
          }}
          className={`
            flex-shrink-0 px-3 py-1 rounded text-sm font-medium
            ${style.textColor} ${style.buttonHover}
            transition-colors duration-200
          `}
        >
          {action.label}
        </button>
      )}

      {/* 닫기 버튼 */}
      <button
        onClick={() => onClose?.()}
        className={`
          flex-shrink-0 text-lg leading-none
          ${style.textColor} opacity-50 hover:opacity-100
          transition-opacity duration-200
        `}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}

export default Toast
