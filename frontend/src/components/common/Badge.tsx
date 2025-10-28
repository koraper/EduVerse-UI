import type { BadgeProps } from './types'

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  dot = false,
  className = '',
}: BadgeProps) => {
  // 기본 스타일
  const baseStyles = 'inline-flex items-center font-medium transition-colors'

  // Variant 스타일
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-blue-100 text-blue-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  }

  // Size 스타일
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  }

  // Pill 스타일
  const shapeStyles = pill ? 'rounded-full' : 'rounded'

  // Dot variant 스타일
  const dotVariantStyles = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-blue-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  }

  // 최종 클래스명 조합
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles} ${className}`.trim()

  return (
    <span className={combinedClassName}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotVariantStyles[variant]}`}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
