import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/common'
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'
import { INPUT_LIMITS } from '@/utils/inputValidation'
import { validatePassword } from '@/utils/passwordValidation'
import { validateName, validateEmail, validateStudentId, FORM_INPUT_LIMITS } from '@/utils/formValidation'
import LandingHeader from '@/pages/landing/LandingHeader'

// 회원가입 폼 입력 제한
const REGISTER_INPUT_LIMITS = {
  email: 100,      // FORM_INPUT_LIMITS.email.max
  name: 50,        // FORM_INPUT_LIMITS.name.max
  studentId: 20,   // validateStudentId 함수에서 정의한 maxLength
} as const

const StudentSignupPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
  })
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    terms: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''))

  // 필수 필드 입력 확인 (회원가입 버튼 활성화 조건)
  const isFormValid = () => {
    // 이메일, 이름, 비밀번호, 비밀번호 확인이 모두 입력되어야 함
    const hasRequiredFields =
      formData.email.trim() &&
      formData.name.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim()

    // 약관 동의 확인
    const hasAgreedToTerms = formData.agreedToTerms && formData.agreedToPrivacy

    // 에러가 없어야 함
    const hasNoErrors =
      !errors.email &&
      !errors.name &&
      !errors.password &&
      !errors.confirmPassword &&
      !errors.studentId

    // 비밀번호가 유효해야 함
    const isPasswordValid = validatePassword(formData.password).valid

    // 비밀번호와 비밀번호 확인이 일치해야 함
    const passwordsMatch = formData.password === formData.confirmPassword

    return hasRequiredFields && hasAgreedToTerms && hasNoErrors && isPasswordValid && passwordsMatch
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      studentId: '',
      terms: '',
    }

    // 이메일 검증 - formValidation 유틸 사용
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // 이름 검증 - formValidation 유틸 사용
    const nameError = validateName(formData.name)
    if (nameError) {
      newErrors.name = nameError
    }

    // 비밀번호 검증 - passwordValidation 유틸 사용
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else {
      const validation = validatePassword(formData.password)
      if (!validation.valid) {
        newErrors.password = validation.errors[0] || '비밀번호가 정책을 충족하지 않습니다'
      }
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }

    // 학번 검증 (선택사항)
    if (formData.studentId) {
      const studentIdError = validateStudentId(formData.studentId, false)
      if (studentIdError) {
        newErrors.studentId = studentIdError
      }
    }

    // 약관 동의 검증
    if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
      newErrors.terms = '이용약관 및 개인정보처리방침에 동의해주세요'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => !error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const user = await register(
        formData.email,
        formData.name,
        formData.password,
        'student'
      )

      // 학생 대시보드로 리다이렉트
      navigate('/student/dashboard')
    } catch (error: any) {
      setApiError(error.message || '회원가입에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // 입력시 에러 메시지 초기화
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, studentId: value }))

    // 실시간 유효성 검증
    if (value.trim()) {
      const error = validateStudentId(value, false)
      setErrors((prev) => ({ ...prev, studentId: error || '' }))
    } else {
      setErrors((prev) => ({ ...prev, studentId: '' }))
    }
    setApiError('')
  }

  return (
    <>
      {/* 랜딩 헤더 */}
      <LandingHeader />

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-md w-full">
          {/* 로고 및 헤더 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                E
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">학생 회원가입</h2>
            <p className="mt-2 text-gray-600">초대코드를 받으셨나요? 5분 만에 시작하세요</p>
          </div>

          {/* 회원가입 폼 카드 */}
          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* API 에러 메시지 */}
              {apiError && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                  </div>
                </div>
              )}

              {/* 이메일 입력 */}
              <Input
                label={<span>이메일 <span className="text-error-500">*</span></span>}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="example@eduverse.com"
                maxLength={REGISTER_INPUT_LIMITS.email}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* 이름 입력 */}
              <Input
                label={<span>이름 <span className="text-error-500">*</span></span>}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="홍길동"
                maxLength={REGISTER_INPUT_LIMITS.name}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              {/* 학번 입력 (선택사항) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Input
                  label="학번 (선택사항)"
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleStudentIdChange}
                  error={errors.studentId}
                  maxLength={REGISTER_INPUT_LIMITS.studentId}
                  placeholder="2024123456"
                  helperText={
                    !errors.studentId ? (
                      <div className="text-xs text-blue-600 space-y-1 mt-2">
                        <p>📝 입력 가능한 형식:</p>
                        <ul className="list-disc list-inside ml-2">
                          <li>숫자만: 2024123456, 20241234</li>
                          <li>문자+숫자: STU20241234, CS2024123</li>
                          <li>하이픈/언더스코어: 2024-1-12345, STU_2024_123</li>
                        </ul>
                        <p className="mt-2">❌ 불가능한 형식:</p>
                        <ul className="list-disc list-inside ml-2">
                          <li>한글 포함, 공백, 특수문자(@, !, # 등)</li>
                          <li>문자만: ABC, STU (숫자 필수)</li>
                        </ul>
                      </div>
                    ) : undefined
                  }
                />
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <Input
                  label={<span>비밀번호 <span className="text-error-500">*</span></span>}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e)
                    setPasswordValidation(validatePassword(e.target.value))
                  }}
                  maxLength={INPUT_LIMITS.password}
                  error={errors.password}
                  placeholder="8-20자, 영문 대소문자+숫자+특수문자 중 2가지 이상 조합"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
                {formData.password && (
                  <div className="mt-3">
                    <PasswordStrengthIndicator
                      password={formData.password}
                      showLabel={true}
                      showPercentage={true}
                    />
                  </div>
                )}
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200 text-xs">
                  <p className="text-blue-700 font-medium mb-2">비밀번호 정책 요구사항:</p>
                  <ul className="text-blue-600 space-y-1">
                    <li className="flex items-center">
                      <span className={`mr-2 ${formData.password.length >= 8 && formData.password.length <= 20 ? 'text-success-600' : 'text-gray-600'}`}>✓</span>
                      8-20자 범위
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${passwordValidation.complexity.complexityCount >= 2 ? 'text-success-600' : 'text-gray-600'}`}>✓</span>
                      영문 대소문자+숫자+특수문자 중 2가지 이상 조합 ({passwordValidation.complexity.complexityCount}/4)
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="mr-2">✓</span> 연속된 문자 3개 이상 불가
                    </li>
                  </ul>
                </div>
              </div>

              {/* 비밀번호 확인 입력 */}
              <Input
                label={<span>비밀번호 확인 <span className="text-error-500">*</span></span>}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                maxLength={INPUT_LIMITS.password}
                error={errors.confirmPassword}
                placeholder="비밀번호를 다시 입력하세요"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* 약관 동의 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    <span className="text-error-500">*</span> 이용약관에 동의합니다{' '}
                    <button
                      type="button"
                      onClick={() => alert('이용약관 페이지는 추후 구현 예정입니다')}
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      보기
                    </button>
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreedToPrivacy"
                    checked={formData.agreedToPrivacy}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    <span className="text-error-500">*</span> 개인정보처리방침에 동의합니다{' '}
                    <button
                      type="button"
                      onClick={() => alert('개인정보처리방침 페이지는 추후 구현 예정입니다')}
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      보기
                    </button>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-error-600 mt-1">{errors.terms}</p>
                )}
              </div>

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={!isFormValid() || isLoading}
              >
                회원가입
              </Button>

              {/* 로그인 링크 */}
              <div className="text-center text-sm">
                <span className="text-gray-600">이미 계정이 있으신가요? </span>
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  로그인
                </Link>
              </div>
            </form>
          </Card>

          {/* 홈으로 돌아가기 */}
          <div className="text-center mt-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentSignupPage
