import { forwardRef, useState } from 'react'
import type { InputProps } from './types'
import InputCounter from './InputCounter'
import { limitInputLength } from '@/utils/inputValidation'

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      leftIcon,
      rightIcon,
      className = '',
      type = 'text',
      disabled,
      maxLength: propMaxLength,
      showLengthCounter = false,
      onLengthChange,
      onChange,
      value: propValue,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState((propValue as string) || '')
    const [showPassword, setShowPassword] = useState(false)
    const value = propValue !== undefined ? (propValue as string) : internalValue
    const isPasswordField = type === 'password'
    const displayType = isPasswordField && showPassword ? 'text' : type
    const maxLength = propMaxLength
    // 기본 input 스타일
    const baseStyles = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100'

    // 에러 상태에 따른 스타일
    const stateStyles = error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'

    // Size 스타일
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    }

    // 아이콘이 있을 때 패딩 조정
    const hasRightIcon = rightIcon || isPasswordField
    const iconPaddingStyles = leftIcon ? 'pl-10' : hasRightIcon ? 'pr-10' : ''

    // 최종 클래스명 조합
    const combinedClassName = `${baseStyles} ${stateStyles} ${sizeStyles[size]} ${iconPaddingStyles} ${className}`.trim()

    // 입력값 변경 처리
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value

      // maxLength가 설정되어 있으면 길이 제한
      if (maxLength && newValue.length > maxLength) {
        newValue = limitInputLength(newValue, maxLength)
        e.target.value = newValue
      }

      setInternalValue(newValue)

      // 길이 변경 콜백
      if (onLengthChange) {
        onLengthChange(newValue.length)
      }

      // 원본 onChange 콜백
      if (onChange) {
        onChange(e)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={displayType}
            className={combinedClassName}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            {...props}
          />
          {isPasswordField ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
            >
              {showPassword ? (
                // 눈 아이콘 (보이는 상태)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // 눈 슬래시 아이콘 (숨겨진 상태)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.364 5.636l1.414-1.414M9.172 9.172L7.757 7.757m3.61 9.192l1.415 1.414M9.172 9.172l-1.415-1.415" />
                </svg>
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {/* 길이 카운터 표시 */}
        {showLengthCounter && maxLength && (
          <div className="mt-2">
            <InputCounter
              currentLength={value.length}
              maxLength={maxLength}
              showPercentage={true}
              showWarning={true}
            />
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
