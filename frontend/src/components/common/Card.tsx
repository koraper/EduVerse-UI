import type { CardProps } from './types'

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
  // 기본 스타일
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200'

  // Hoverable 스타일
  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:border-gray-300 cursor-pointer'
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
        <div className={`border-b border-gray-200 ${paddingStyles[padding]} pb-3`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}

      {/* Body */}
      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`border-t border-gray-200 ${paddingStyles[padding]} pt-3 bg-gray-50`}>
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
