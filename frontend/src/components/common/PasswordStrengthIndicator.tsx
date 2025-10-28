import {
  getPasswordStrengthLevel,
  calculatePasswordStrength,
  PasswordStrengthInfo,
} from '@/utils/passwordValidation'

interface PasswordStrengthIndicatorProps {
  password: string
  showLabel?: boolean
  showPercentage?: boolean
}

/**
 * 비밀번호 강도를 시각화하는 컴포넌트
 * - 실시간 강도 평가 (약함/보통/좋음/매우 강함)
 * - 색상 기반 피드백
 * - 백분율 표시 (선택사항)
 */
const PasswordStrengthIndicator = ({
  password,
  showLabel = true,
  showPercentage = true,
}: PasswordStrengthIndicatorProps) => {
  const strength = calculatePasswordStrength(password)
  const level = getPasswordStrengthLevel(password)
  const info = PasswordStrengthInfo[level]

  return (
    <div className="space-y-2">
      {/* 강도 레벨 레이블 및 백분율 */}
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className={`text-sm font-medium ${info.textColor}`}>
            강도: {info.label}
          </span>
        )}
        {showPercentage && (
          <span className={`text-xs ${info.textColor}`}>
            {strength}%
          </span>
        )}
      </div>

      {/* 강도 바 */}
      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${info.color}`}
          style={{ width: `${strength}%` }}
        />
      </div>

      {/* 강도 메시지 */}
      <p className={`text-xs ${info.textColor}`}>
        {info.message}
      </p>
    </div>
  )
}

export default PasswordStrengthIndicator
