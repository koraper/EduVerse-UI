/**
 * 폼 입력값 검증 유틸리티
 * ContactSection, RegisterPage, ProfilePage 등에서 재사용
 */

// 입력값 제한
export const FORM_INPUT_LIMITS = {
  name: { min: 2, max: 50 },
  email: { max: 100 },
  phone: { min: 10, max: 13 },
  organization: { max: 100 },
  message: { min: 10, max: 1000 },
  address: { max: 200 },
  department: { max: 100 },
} as const

/**
 * 이름 검증 (한글, 영문, 공백만 허용)
 */
export const validateName = (name: string): string | undefined => {
  if (!name.trim()) return '이름을 입력해 주세요'

  if (name.length < FORM_INPUT_LIMITS.name.min) {
    return `이름은 최소 ${FORM_INPUT_LIMITS.name.min}자 이상이어야 합니다`
  }

  if (name.length > FORM_INPUT_LIMITS.name.max) {
    return `이름은 최대 ${FORM_INPUT_LIMITS.name.max}자까지 입력 가능합니다`
  }

  if (!/^[가-힣a-zA-Z\s]+$/.test(name)) {
    return '이름은 한글 또는 영문만 입력 가능합니다'
  }

  return undefined
}

/**
 * 이메일 검증
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return '이메일을 입력해 주세요'

  if (email.length > FORM_INPUT_LIMITS.email.max) {
    return `이메일은 최대 ${FORM_INPUT_LIMITS.email.max}자까지 입력 가능합니다`
  }

  // RFC 5322 표준에 가까운 이메일 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식이 아닙니다'
  }

  return undefined
}

/**
 * 전화번호 검증 (한국 전화번호 형식)
 */
export const validatePhone = (phone: string, required = true): string | undefined => {
  if (!phone.trim()) {
    return required ? '연락처를 입력해 주세요' : undefined
  }

  // 하이픈 제거 후 검증
  const cleanPhone = phone.replace(/-/g, '')

  if (cleanPhone.length < FORM_INPUT_LIMITS.phone.min) {
    return '연락처는 최소 10자리 이상이어야 합니다'
  }

  if (cleanPhone.length > FORM_INPUT_LIMITS.phone.max) {
    return '연락처는 최대 13자리까지 입력 가능합니다'
  }

  // 한국 전화번호 형식 검증
  // - 휴대폰: 010, 011, 016, 017, 018, 019
  // - 지역번호: 02 (서울), 031~069 (경기/지방)
  // - 형식: 010-XXXX-XXXX, 02-XXX-XXXX, 031-XXX-XXXX 등
  const phoneRegex = /^(01[016789]|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/
  if (!phoneRegex.test(phone)) {
    return '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678, 02-1234-5678)'
  }

  return undefined
}

/**
 * 전화번호 자동 하이픈 추가
 */
export const formatPhoneNumber = (phone: string): string => {
  // 숫자만 추출
  const cleaned = phone.replace(/\D/g, '')

  // 010으로 시작하는 휴대폰 번호
  if (cleaned.startsWith('01')) {
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }

  // 02 (서울) 지역번호
  if (cleaned.startsWith('02')) {
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`
  }

  // 기타 지역번호 (3자리)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
}

/**
 * 텍스트 필드 검증 (선택 필드)
 */
export const validateTextField = (
  value: string,
  fieldName: string,
  maxLength: number,
  required = false
): string | undefined => {
  if (required && !value.trim()) {
    return `${fieldName}을(를) 입력해 주세요`
  }

  if (value && value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다`
  }

  return undefined
}

/**
 * 긴 텍스트 필드 검증 (메시지, 내용 등)
 */
export const validateLongTextField = (
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number,
  required = true
): string | undefined => {
  if (required && !value.trim()) {
    return `${fieldName}을(를) 입력해 주세요`
  }

  if (value && value.length < minLength) {
    return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다`
  }

  if (value && value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다`
  }

  return undefined
}

/**
 * 소속기관/학과 검증
 */
export const validateOrganization = (organization: string, required = false): string | undefined => {
  if (required && !organization.trim()) {
    return '소속 기관을 입력해 주세요'
  }

  if (organization && organization.length > FORM_INPUT_LIMITS.organization.max) {
    return `소속 기관은 최대 ${FORM_INPUT_LIMITS.organization.max}자까지 입력 가능합니다`
  }

  return undefined
}

/**
 * 문의 내용 검증
 */
export const validateMessage = (message: string): string | undefined => {
  return validateLongTextField(
    message,
    '문의 내용',
    FORM_INPUT_LIMITS.message.min,
    FORM_INPUT_LIMITS.message.max,
    true
  )
}

/**
 * 주소 검증
 */
export const validateAddress = (address: string, required = false): string | undefined => {
  return validateTextField(address, '주소', FORM_INPUT_LIMITS.address.max, required)
}

/**
 * 학과 검증
 */
export const validateDepartment = (department: string, required = false): string | undefined => {
  return validateTextField(department, '학과', FORM_INPUT_LIMITS.department.max, required)
}

/**
 * 학번 검증 (숫자만, 또는 문자+숫자 조합 허용, 선택사항)
 * 허용 형식:
 * - 숫자만: 2024123456, 20241234
 * - 문자+숫자: STU20241234, 2024-1-12345, CS2024123 등
 * 불허 형식:
 * - 한글: 스물네, 학번 등
 * - 특수문자(하이픈, 언더스코어 제외): @, !, # 등
 * - 공백 포함
 */
export const validateStudentId = (studentId: string, required = false): string | undefined => {
  // 선택사항이고 비어있으면 통과
  if (!studentId.trim()) {
    return required ? '학번을 입력해 주세요' : undefined
  }

  // 최대 길이 제한
  const maxLength = 20
  if (studentId.length > maxLength) {
    return `학번은 최대 ${maxLength}자까지 입력 가능합니다`
  }

  // 공백 포함 체크
  if (/\s/.test(studentId)) {
    return '학번에는 공백이 포함될 수 없습니다'
  }

  // 한글 포함 체크
  if (/[가-힣]/g.test(studentId)) {
    return '학번에는 한글이 포함될 수 없습니다'
  }

  // 허용된 문자 확인: 숫자, 영문(대소), 하이픈(-), 언더스코어(_)
  if (!/^[a-zA-Z0-9\-_]+$/.test(studentId)) {
    return '학번은 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
  }

  // 최소 1개 이상의 숫자 포함 확인
  if (!/\d/.test(studentId)) {
    return '학번에는 최소 1개 이상의 숫자가 포함되어야 합니다'
  }

  return undefined
}

/**
 * 여러 필드를 한 번에 검증하는 헬퍼 함수
 */
export interface ValidationErrors {
  [key: string]: string | undefined
}

export const validateMultipleFields = (
  fields: Record<string, any>,
  validators: Record<string, (value: any) => string | undefined>
): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {}

  Object.keys(validators).forEach((fieldName) => {
    const validator = validators[fieldName]
    const value = fields[fieldName]
    const error = validator(value)

    if (error) {
      errors[fieldName] = error
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 실시간 입력 길이 제한 적용
 */
export const applyInputLimit = (value: string, maxLength: number): string => {
  if (value.length > maxLength) {
    return value.slice(0, maxLength)
  }
  return value
}

/**
 * 글자 수 카운터 포맷
 */
export const formatCharCount = (currentLength: number, maxLength: number): string => {
  return `(${currentLength}/${maxLength})`
}

/**
 * 입력 필드 에러 상태 클래스
 */
export const getInputErrorClass = (hasError: boolean, baseClass = ''): string => {
  if (hasError) {
    return `${baseClass} border-red-500`.trim()
  }
  return `${baseClass} border-gray-500`.trim()
}
