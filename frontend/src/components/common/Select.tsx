import { forwardRef } from 'react'
import type { SelectProps } from './types'
import { useTheme } from '@/contexts/ThemeContext'

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      options,
      placeholder,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme()

    // 기본 select 스타일 (Input과 동일한 스타일 적용)
    const baseStyles = `block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
      currentTheme === 'dark'
        ? 'disabled:bg-gray-700 bg-gray-800 text-white'
        : 'disabled:bg-gray-100 bg-white text-gray-900'
    }`

    // 에러 상태에 따른 스타일
    const stateStyles = error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
      : currentTheme === 'dark'
        ? 'border-gray-700 focus:border-primary-500 focus:ring-primary-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'

    // Size 스타일
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    }

    // 최종 클래스명 조합
    const combinedClassName = `${baseStyles} ${stateStyles} ${sizeStyles[size]} ${className}`.trim()

    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium mb-1 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={combinedClassName}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {/* options prop이 있으면 사용, 없으면 children 사용 */}
          {options && options.length > 0
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
        {!error && helperText && (
          <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
