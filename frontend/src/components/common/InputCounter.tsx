import {
  getRemainingCharacters,
  getInputLengthStatus,
  formatInputLimitInfo,
} from '@/utils/inputValidation'

interface InputCounterProps {
  currentLength: number
  maxLength: number
  showPercentage?: boolean
  showWarning?: boolean
}

/**
 * 입력 필드의 글자 수를 표시하는 컴포넌트
 * - 현재 글자 수 표시
 * - 남은 글자 수 표시
 * - 상태에 따른 시각적 피드백
 */
const InputCounter = ({
  currentLength,
  maxLength,
  showPercentage = true,
  showWarning = true,
}: InputCounterProps) => {
  const remaining = getRemainingCharacters('x'.repeat(currentLength), maxLength)
  const status = getInputLengthStatus('x'.repeat(currentLength), maxLength)
  const exceedAmount = currentLength - maxLength

  // 상태별 색상
  const statusColors = {
    normal: 'text-gray-500',
    warning: 'text-warning-600',
    danger: 'text-error-600',
  }

  // 상태별 배경색
  const barColors = {
    normal: 'bg-gray-200',
    warning: 'bg-warning-200',
    danger: 'bg-error-200',
  }

  const fillColors = {
    normal: 'bg-gray-400',
    warning: 'bg-warning-500',
    danger: 'bg-error-500',
  }

  // 사용 비율 계산
  const usagePercentage = Math.min((currentLength / maxLength) * 100, 100)

  return (
    <div className="space-y-2">
      {/* 숫자 표시 */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${statusColors[status]}`}>
          {formatInputLimitInfo(currentLength, maxLength)}
        </span>

        {showPercentage && (
          <span className={`text-xs ${statusColors[status]}`}>
            {Math.round((currentLength / maxLength) * 100)}%
          </span>
        )}
      </div>

      {/* 진행 바 */}
      <div className={`w-full h-2 rounded-full ${barColors[status]} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-200 ${fillColors[status]}`}
          style={{ width: `${usagePercentage}%` }}
        />
      </div>

      {/* 경고 메시지 */}
      {showWarning && (
        <>
          {status === 'danger' && (
            <p className="text-xs text-error-600 font-medium">
              {exceedAmount}자 초과되었습니다. {maxLength}자 이내로 입력해주세요.
            </p>
          )}
          {status === 'warning' && (
            <p className="text-xs text-warning-600 font-medium">
              남은 글자: {remaining}자
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default InputCounter
