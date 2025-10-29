import type { CardProps } from './types'
import { useTheme } from '@/contexts/ThemeContext'

const Card = ({
  children,
  title,
  subtitle,
  footer,
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
}: CardProps) => {
  const { currentTheme } = useTheme()

  // 기본 스타일
  const baseStyles = `rounded-lg border shadow-sm hover:shadow-lg transition-all duration-200 ${
    currentTheme === 'dark'
      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
      : 'bg-white border-gray-200 hover:border-gray-300'
  }`

  // Hoverable 스타일
  const hoverStyles = hoverable
    ? 'cursor-pointer'
    : ''

  // Padding 스타일
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  // 최종 클래스명 조합
  const combinedClassName = `${baseStyles} ${hoverStyles} ${className}`.trim()

  return (
    <div className={combinedClassName} onClick={onClick}>
      {/* Header */}
      {(title || subtitle) && (
        <div className={`pb-3 ${paddingStyles[padding]} border-b ${
          currentTheme === 'dark'
            ? 'border-gray-700'
            : 'border-gray-200'
        }`}>
          {title && (
            <h3 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          )}
          {subtitle && (
            <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>
      )}

      {/* Body */}
      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`pt-3 ${paddingStyles[padding]} border-t ${
          currentTheme === 'dark'
            ? 'border-gray-700 bg-gray-700'
            : 'border-gray-200 bg-gray-50'
        }`}>
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
