/**
 * 입력 필드 길이 제한 규칙
 */
export const INPUT_LIMITS = {
  // 텍스트 필드
  text: {
    short: 50,           // 짧은 텍스트 (이름, 타이틀 등)
    medium: 255,         // 중간 텍스트 (설명, 주소 등)
    long: 1000,          // 긴 텍스트 (내용, 메모 등)
    extraLong: 5000,     // 매우 긴 텍스트 (상세 설명 등)
  },

  // 특정 필드
  email: 254,            // 이메일 최대 길이
  phone: 20,             // 전화번호
  url: 2048,             // URL
  password: 20,          // 비밀번호 (최대 20자)
  username: 50,          // 사용자명
  title: 100,            // 제목
  description: 500,      // 설명
  content: 10000,        // 본문 내용
  code: 100,             // 코드 (초대 코드 등)

  // 관리자 설정용
  settings: {
    appName: 100,        // 앱 이름
    appDescription: 500, // 앱 설명
    smtpServer: 255,     // SMTP 서버
    senderEmail: 254,    // 발신자 이메일
    senderName: 100,     // 발신자 이름
    apiKey: 500,         // API 키
    secretKey: 500,      // 비밀 키
    configValue: 1000,   // 설정 값
  },
}

/**
 * 입력 값의 길이를 제한합니다
 */
export const limitInputLength = (
  value: string,
  maxLength: number
): string => {
  if (!value) return ''
  return value.slice(0, maxLength)
}

/**
 * 입력 값이 최대 길이를 초과했는지 확인합니다
 */
export const isExceedingLimit = (
  value: string,
  maxLength: number
): boolean => {
  return value.length > maxLength
}

/**
 * 입력 필드의 남은 글자 수를 계산합니다
 */
export const getRemainingCharacters = (
  value: string,
  maxLength: number
): number => {
  return Math.max(0, maxLength - (value?.length || 0))
}

/**
 * 입력 필드의 남은 글자 비율을 계산합니다 (퍼센트)
 */
export const getRemainingPercentage = (
  value: string,
  maxLength: number
): number => {
  const remaining = getRemainingCharacters(value, maxLength)
  return Math.round((remaining / maxLength) * 100)
}

/**
 * 입력 필드 길이 상태를 반환합니다 (스타일용)
 */
export const getInputLengthStatus = (
  value: string,
  maxLength: number
): 'normal' | 'warning' | 'danger' => {
  const percentage = getRemainingPercentage(value, maxLength)

  if (percentage <= 0) return 'danger'      // 초과
  if (percentage <= 20) return 'warning'    // 경고 (80% 이상 사용)
  return 'normal'                           // 정상
}

/**
 * 입력 값을 검증합니다
 */
export interface ValidationRule {
  maxLength: number
  pattern?: RegExp
  required?: boolean
  custom?: (value: string) => boolean | string
}

export const validateInput = (
  value: string,
  rule: ValidationRule
): { valid: boolean; error?: string } => {
  // 필수 입력 확인
  if (rule.required && !value.trim()) {
    return { valid: false, error: '필수 입력 항목입니다' }
  }

  // 길이 확인
  if (value.length > rule.maxLength) {
    return {
      valid: false,
      error: `최대 ${rule.maxLength}자까지 입력 가능합니다`,
    }
  }

  // 패턴 확인
  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, error: '유효하지 않은 형식입니다' }
  }

  // 커스텀 검증
  if (rule.custom) {
    const result = rule.custom(value)
    if (result !== true) {
      return {
        valid: false,
        error: typeof result === 'string' ? result : '검증에 실패했습니다',
      }
    }
  }

  return { valid: true }
}

/**
 * 공통 검증 규칙 모음
 */
export const commonValidationRules = {
  email: {
    maxLength: INPUT_LIMITS.email,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
  } as ValidationRule,

  password: {
    maxLength: INPUT_LIMITS.password,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/, // 영문+숫자, 8자 이상
    required: true,
  } as ValidationRule,

  username: {
    maxLength: INPUT_LIMITS.username,
    pattern: /^[a-zA-Z0-9_-]{3,}$/, // 영문, 숫자, 언더스코어, 하이픈, 3자 이상
    required: true,
  } as ValidationRule,

  phone: {
    maxLength: INPUT_LIMITS.phone,
    pattern: /^[0-9\-\s()]+$/, // 숫자, 하이픈, 공백, 괄호만 허용
  } as ValidationRule,

  url: {
    maxLength: INPUT_LIMITS.url,
    pattern: /^https?:\/\/.+/, // http 또는 https로 시작
  } as ValidationRule,

  appName: {
    maxLength: INPUT_LIMITS.settings.appName,
    required: true,
  } as ValidationRule,

  appDescription: {
    maxLength: INPUT_LIMITS.settings.appDescription,
  } as ValidationRule,

  smtpServer: {
    maxLength: INPUT_LIMITS.settings.smtpServer,
    required: true,
  } as ValidationRule,

  senderEmail: {
    maxLength: INPUT_LIMITS.settings.senderEmail,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
  } as ValidationRule,
}

/**
 * 입력 문자 제한 정보 포맷팅
 */
export const formatInputLimitInfo = (
  currentLength: number,
  maxLength: number
): string => {
  return `${currentLength}/${maxLength}`
}

/**
 * 입력 값 길이 경고 메시지
 */
export const getInputLimitWarning = (
  value: string,
  maxLength: number
): string | null => {
  const remaining = getRemainingCharacters(value, maxLength)

  if (remaining < 0) {
    return `${Math.abs(remaining)}자 초과되었습니다`
  }

  if (remaining <= 10) {
    return `${remaining}자 남았습니다`
  }

  return null
}
