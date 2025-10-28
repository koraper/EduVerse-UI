import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/common'
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'
import { INPUT_LIMITS } from '@/utils/inputValidation'
import { validatePassword } from '@/utils/passwordValidation'
import { validateName, validateEmail, validateStudentId, FORM_INPUT_LIMITS } from '@/utils/formValidation'

// 회원가입 폼 입력 제한
const REGISTER_INPUT_LIMITS = {
  email: 100,      // FORM_INPUT_LIMITS.email.max
  name: 50,        // FORM_INPUT_LIMITS.name.max
  studentId: 20,   // validateStudentId 함수에서 정의한 maxLength
} as const

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: '' as 'student' | 'professor' | '',
    studentId: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: '',
    studentId: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''))

  // 필수 필드 입력 확인 (회원가입 버튼 활성화 조건)
  const isFormValid = () => {
    // 이메일, 이름, 역할, 비밀번호, 비밀번호 확인이 모두 입력되어야 함
    const hasRequiredFields =
      formData.email.trim() &&
      formData.name.trim() &&
      formData.role &&
      formData.password.trim() &&
      formData.confirmPassword.trim()

    // 에러가 없어야 함
    const hasNoErrors =
      !errors.email &&
      !errors.name &&
      !errors.role &&
      !errors.password &&
      !errors.confirmPassword &&
      !errors.studentId

    // 비밀번호가 유효해야 함
    const isPasswordValid = validatePassword(formData.password).valid

    // 비밀번호와 비밀번호 확인이 일치해야 함
    const passwordsMatch = formData.password === formData.confirmPassword

    return hasRequiredFields && hasNoErrors && isPasswordValid && passwordsMatch
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: '',
      studentId: '',
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

    // 비밀번호 검증 - passwordValidation 유틸 사용 (기존 유지)
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

    // 역할 검증
    if (!formData.role) {
      newErrors.role = '역할을 선택해주세요'
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
        formData.role as 'student' | 'professor'
      )

      // 역할별 대시보드로 리다이렉트
      if (user.role === 'professor') {
        navigate('/professor/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (error: any) {
      setApiError(error.message || '회원가입에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 입력시 에러 메시지 초기화
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  const handleRoleSelect = (role: 'student' | 'professor') => {
    setFormData((prev) => ({
      ...prev,
      role,
      studentId: role === 'student' ? prev.studentId : '',
    }))
    setErrors((prev) => ({ ...prev, role: '', studentId: '' }))
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full min-w-[500px]">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              E
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">EduVerse 회원가입</h2>
          <p className="mt-2 text-gray-600">새로운 계정을 만들어 학습을 시작하세요</p>
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

            {/* 역할 선택 - 버튼형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                역할 <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                    formData.role === 'student'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z" />
                    </svg>
                    학생
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('professor')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                    formData.role === 'professor'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    교수
                  </div>
                </button>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-error-600">{errors.role}</p>
              )}
            </div>

            {/* 학번 입력 - 학생만 표시 */}
            {formData.role === 'student' && (
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
                      <div className="text-xs text-blue-600 space-y-1">
                        <p>📝 입력 가능한 형식:</p>
                        <ul className="list-disc list-inside">
                          <li>숫자만: 2024123456, 20241234</li>
                          <li>문자+숫자: STU20241234, CS2024123</li>
                          <li>하이픈/언더스코어: 2024-1-12345, STU_2024_123</li>
                        </ul>
                        <p>❌ 불가능한 형식:</p>
                        <ul className="list-disc list-inside">
                          <li>한글 포함, 공백, 특수문자(@, !, # 등)</li>
                          <li>문자만: ABC, STU (숫자 필수)</li>
                        </ul>
                      </div>
                    ) : undefined
                  }
                />
              </div>
            )}

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
                placeholder="8-20자, 영문 대소문자+숫자+특수문자 중 2가지 이상 조합2가지 이상 문자 조합"
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
                <p className="text-blue-700 font-medium mb-2">정책 요구사항:</p>
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
  )
}

export default RegisterPage
