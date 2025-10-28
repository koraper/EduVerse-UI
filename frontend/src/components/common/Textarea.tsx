import { forwardRef, useState } from 'react'
import type { TextareaProps } from './types'
import InputCounter from './InputCounter'
import { limitInputLength } from '@/utils/inputValidation'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      resize = true,
      className = '',
      disabled,
      rows = 4,
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
    const value = propValue !== undefined ? (propValue as string) : internalValue
    const maxLength = propMaxLength
    // 기본 textarea 스타일
    const baseStyles = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 px-4 py-2'

    // 에러 상태에 따른 스타일
    const stateStyles = error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'

    // resize 스타일
    const resizeStyles = resize ? 'resize-y' : 'resize-none'

    // 최종 클래스명 조합
    const combinedClassName = `${baseStyles} ${stateStyles} ${resizeStyles} ${className}`.trim()

    // 입력값 변경 처리
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        <textarea
          ref={ref}
          rows={rows}
          className={combinedClassName}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />

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

Textarea.displayName = 'Textarea'

export default Textarea
