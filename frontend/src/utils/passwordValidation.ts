/**
 * 비밀번호 정책
 */
export const PASSWORD_POLICY = {
  minLength: 8,           // 최소 8자
  maxLength: 20,          // 최대 20자
  minComplexity: 2,       // 최소 2가지 조합 필요
} as const

/**
 * 비밀번호 복잡도 체크
 * - 영문 대문자 (A-Z)
 * - 영문 소문자 (a-z)
 * - 숫자 (0-9)
 * - 특수문자 (!@#$%^&*...)
 */
export interface PasswordComplexity {
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  complexityCount: number
}

/**
 * 비밀번호의 복잡도를 분석합니다
 */
export const analyzePasswordComplexity = (password: string): PasswordComplexity => {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  const complexityCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length

  return {
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    complexityCount,
  }
}

/**
 * 연속된 같은 문자가 있는지 확인
 * 예: "aaa", "111", "AAA" 등
 */
export const hasConsecutiveChars = (password: string): boolean => {
  // 같은 문자가 3개 이상 연속되는지 확인
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return true
    }
  }
  return false
}

/**
 * 비밀번호 유효성 검증
 */
export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  complexity: PasswordComplexity
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  const complexity = analyzePasswordComplexity(password)

  // 길이 검증
  if (!password) {
    errors.push('비밀번호를 입력해주세요')
  } else if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`최소 ${PASSWORD_POLICY.minLength}자 이상이어야 합니다`)
  } else if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`최대 ${PASSWORD_POLICY.maxLength}자까지만 입력 가능합니다`)
  }

  // 복잡도 검증
  if (password && complexity.complexityCount < PASSWORD_POLICY.minComplexity) {
    errors.push(
      `영문 대소문자, 숫자, 특수문자 중 최소 ${PASSWORD_POLICY.minComplexity}가지 이상 조합이 필요합니다`
    )
  }

  // 경고사항
  if (password && complexity.complexityCount === PASSWORD_POLICY.minComplexity) {
    warnings.push(`현재 ${complexity.complexityCount}가지 조합만 포함되어 있습니다. 더 강력한 비밀번호를 권장합니다.`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    complexity,
  }
}

/**
 * 비밀번호 강도 평가 (0-100)
 */
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0

  let strength = 0

  // 길이 점수 (20점)
  if (password.length >= PASSWORD_POLICY.minLength && password.length <= PASSWORD_POLICY.maxLength) {
    strength += 20
  }

  // 복잡도 점수 (80점 - 4가지 중 1가지당 20점)
  const complexity = analyzePasswordComplexity(password)
  strength += complexity.complexityCount * 20

  return Math.min(strength, 100)
}

/**
 * 비밀번호 강도 레벨 판정
 */
export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export const getPasswordStrengthLevel = (password: string): PasswordStrengthLevel => {
  const strength = calculatePasswordStrength(password)

  if (strength <= 20) return 'weak'
  if (strength <= 40) return 'fair'
  if (strength <= 60) return 'good'
  return 'strong'
}

/**
 * 비밀번호 강도 레벨별 정보
 */
export const PasswordStrengthInfo = {
  weak: {
    label: '약함',
    color: 'bg-error-500',
    textColor: 'text-error-600',
    message: '더 강력한 비밀번호가 필요합니다',
  },
  fair: {
    label: '보통',
    color: 'bg-warning-500',
    textColor: 'text-warning-600',
    message: '괜찮은 비밀번호입니다',
  },
  good: {
    label: '좋음',
    color: 'bg-primary-500',
    textColor: 'text-primary-600',
    message: '좋은 비밀번호입니다',
  },
  strong: {
    label: '매우 강함',
    color: 'bg-success-500',
    textColor: 'text-success-600',
    message: '매우 강력한 비밀번호입니다',
  },
} as const

/**
 * 비밀번호 정책 설명 반환
 */
export const getPasswordPolicyDescription = (): string => {
  return `
    비밀번호는 다음 정책을 따라야 합니다:
    • 최소 ${PASSWORD_POLICY.minLength}자 이상, 최대 ${PASSWORD_POLICY.maxLength}자 이하
    • 영문 대소문자, 숫자, 특수문자 중 최소 ${PASSWORD_POLICY.minComplexity}가지 이상 조합
  `.trim()
}

/**
 * 사용 가능한 특수문자 목록
 */
export const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{};\':"|,.<>/?'

/**
 * 특수문자가 유효한지 확인
 */
export const isValidSpecialChar = (char: string): boolean => {
  return SPECIAL_CHARS.includes(char)
}
