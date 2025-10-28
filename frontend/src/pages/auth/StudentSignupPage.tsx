import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input, Card } from '@/components/common'
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'
import { useToast } from '@/components/common/ToastContext'
import { INPUT_LIMITS } from '@/utils/inputValidation'
import { validatePassword } from '@/utils/passwordValidation'
import { validateName, validateEmail, validateStudentId } from '@/utils/formValidation'
import LandingHeader from '@/pages/landing/LandingHeader'

// 회원가입 폼 입력 제한
const REGISTER_INPUT_LIMITS = {
  email: 100,
  name: 50,
  studentId: 20,
} as const

const StudentSignupPage = () => {
  const navigate = useNavigate()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { addToast } = useToast()

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

  // 이메일 인증 관련 상태
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [verificationError, setVerificationError] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10분
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(30)
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  // 개발 환경 여부
  const isDevelopment = import.meta.env.DEV

  // 10분 타이머
  useEffect(() => {
    if (!showVerificationModal || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, showVerificationModal])

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (!showVerificationModal || resendCooldown <= 0) {
      setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown, showVerificationModal])

  // 이메일 인증 버튼 클릭
  const handleSendVerificationCode = async () => {
    // 이메일 유효성 검증
    const emailError = validateEmail(formData.email)
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }))
      return
    }

    setIsSendingCode(true)
    setVerificationError('')

    try {
      // 개발 환경에서는 API 호출 없이 바로 모달 열기
      if (isDevelopment) {
        // 모달 열기
        setShowVerificationModal(true)
        setTimeLeft(600)
        setResendCooldown(30)
        setCanResend(false)
        setAttemptsLeft(5)
        setVerificationCode(['', '', '', '', '', ''])

        // 첫 번째 입력칸에 포커스
        setTimeout(() => {
          inputRefs.current[0]?.focus()
        }, 100)
        setIsSendingCode(false)
        return
      }

      // 프로덕션: API 호출
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '인증번호 발송에 실패했습니다')
      }

      // 모달 열기
      setShowVerificationModal(true)
      setTimeLeft(600)
      setResendCooldown(30)
      setCanResend(false)
      setAttemptsLeft(5)
      setVerificationCode(['', '', '', '', '', ''])

      // 첫 번째 입력칸에 포커스
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, email: error.message }))
    } finally {
      setIsSendingCode(false)
    }
  }

  // 인증번호 입력 처리
  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    setVerificationError('')

    // 다음 칸으로 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 6자리 모두 입력되면 자동 검증
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerifyCode(newCode.join(''))
    }
  }

  // Backspace 처리
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Paste 처리
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...verificationCode]
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setVerificationCode(newCode)

    if (pastedData.length === 6) {
      handleVerifyCode(pastedData)
    }
  }

  // 인증번호 검증
  const handleVerifyCode = async (code: string) => {
    setVerificationError('')

    try {
      // 개발 환경: 고정 코드
      if (isDevelopment && code === '123456') {
        setIsEmailVerified(true)
        setVerificationSuccess('이메일 인증이 완료되었습니다')
        setTimeout(() => {
          setShowVerificationModal(false)
        }, 1500)
        return
      }

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '인증번호가 일치하지 않습니다')
      }

      setIsEmailVerified(true)
      setVerificationSuccess('이메일 인증이 완료되었습니다')
      setTimeout(() => {
        setShowVerificationModal(false)
      }, 1500)
    } catch (error: any) {
      setAttemptsLeft(prev => prev - 1)
      if (attemptsLeft <= 1) {
        setVerificationError('인증 시도 횟수를 초과했습니다. 새로운 인증번호를 요청하세요.')
      } else {
        setVerificationError(`${error.message} (${attemptsLeft - 1}회 남음)`)
      }
      setVerificationCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  // 재전송
  const handleResend = async () => {
    if (!canResend) return

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (!response.ok) {
        throw new Error('인증번호 재전송에 실패했습니다')
      }

      setVerificationSuccess('새로운 인증번호를 발송했습니다')
      setCanResend(false)
      setResendCooldown(30)
      setTimeLeft(600)
      setAttemptsLeft(5)
      setVerificationCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()

      setTimeout(() => setVerificationSuccess(''), 3000)
    } catch (error: any) {
      setVerificationError(error.message)
    }
  }

  // 이메일 중복 테스트 (개발 모드 전용)
  const handleTestEmailDuplicate = () => {
    addToast('이미 사용 중인 이메일입니다', { variant: 'error', duration: 3000 })
  }

  // 회원가입 입력창 자동 입력 (개발 모드 전용)
  const handleAutoFillForm = () => {
    setFormData({
      email: 'student@test.com',
      name: '홍길동',
      password: 'Test1234!@',
      confirmPassword: 'Test1234!@',
      studentId: '20240001',
      agreedToTerms: true,
      agreedToPrivacy: true
    })
    setIsEmailVerified(true)
    addToast('입력 폼이 자동으로 채워졌습니다', { variant: 'info', duration: 2000 })
  }

  // 필수 필드 입력 확인 (회원가입 버튼 활성화 조건)
  const isFormValid = () => {
    const hasRequiredFields =
      formData.email.trim() &&
      formData.name.trim() &&
      formData.studentId.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim()

    const hasAgreedToTerms = formData.agreedToTerms && formData.agreedToPrivacy

    const hasNoErrors =
      !errors.email &&
      !errors.name &&
      !errors.password &&
      !errors.confirmPassword &&
      !errors.studentId

    const isPasswordValid = validatePassword(formData.password).valid
    const passwordsMatch = formData.password === formData.confirmPassword

    // 이메일 인증 완료 필수
    return hasRequiredFields && hasAgreedToTerms && hasNoErrors && isPasswordValid && passwordsMatch && isEmailVerified
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

    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    const nameError = validateName(formData.name)
    if (nameError) {
      newErrors.name = nameError
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else {
      const validation = validatePassword(formData.password)
      if (!validation.valid) {
        newErrors.password = validation.errors[0] || '비밀번호가 정책을 충족하지 않습니다'
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }

    const studentIdError = validateStudentId(formData.studentId, true)
    if (studentIdError) {
      newErrors.studentId = studentIdError
    }

    if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
      newErrors.terms = '이용약관 및 개인정보처리방침에 동의해주세요'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => !error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!isEmailVerified) {
      setApiError('이메일 인증을 완료해주세요')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 개발 환경: 회원가입 성공으로 가정하고 바로 다음 페이지로 이동
      if (isDevelopment) {
        // 약간의 로딩 시간 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500))

        // 회원가입 성공 Toast 알림
        addToast(`🎉 ${formData.name}님, 회원가입을 축하합니다!`, {
          variant: 'success',
          duration: 2000
        })

        // 2초 후 학생 대시보드로 이동
        setTimeout(() => {
          navigate('/student/dashboard', {
            state: { fromEmailVerification: true }
          })
        }, 2000)
        return
      }

      // 회원가입 API 호출
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          studentId: formData.studentId,
          role: 'student',
          agreedToTerms: formData.agreedToTerms,
          agreedToPrivacy: formData.agreedToPrivacy,
          emailVerified: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '회원가입에 실패했습니다')
      }

      // const data = await response.json()

      // 자동 로그인 (AuthContext 사용)
      // TODO: 백엔드 구현 후 주석 해제
      // login(data.user, data.token)

      // 회원가입 성공 Toast 알림
      addToast(`🎉 ${formData.name}님, 회원가입을 축하합니다!`, {
        variant: 'success',
        duration: 2000
      })

      // 2초 후 학생 대시보드로 이동
      setTimeout(() => {
        navigate('/student/dashboard', {
          state: { fromEmailVerification: true }
        })
      }, 2000)
    } catch (error: any) {
      setApiError(error.message || '회원가입에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, studentId: value }))

    const error = validateStudentId(value, true)
    setErrors((prev) => ({ ...prev, studentId: error || '' }))
    setApiError('')
  }

  // 타이머 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 타이머 색상
  const getTimerColor = () => {
    if (timeLeft === 0) return 'text-red-500'
    if (timeLeft < 60) return 'text-red-500 font-bold'
    if (timeLeft < 300) return 'text-yellow-500'
    return 'text-gray-400'
  }

  return (
    <>
      <LandingHeader />

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-md w-full min-w-[500px]">
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

          {/* 회원가입 폼 */}
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

              {/* 이메일 입력 + 인증 버튼 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span className="text-error-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="이메일 주소를 입력하세요"
                      maxLength={REGISTER_INPUT_LIMITS.email}
                      autoComplete="email"
                      disabled={isEmailVerified}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      }
                      rightIcon={isEmailVerified ? (
                        <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : undefined}
                    />
                  </div>
                  <Button
                    type="button"
                    variant={isEmailVerified ? 'success' : 'outline'}
                    onClick={handleSendVerificationCode}
                    loading={isSendingCode}
                    disabled={!formData.email || !!validateEmail(formData.email) || isEmailVerified || isSendingCode}
                    className="whitespace-nowrap w-[100px] text-[14px]"
                  >
                    {isEmailVerified ? '인증완료' : '인증'}
                  </Button>
                </div>
                {isEmailVerified && (
                  <p className="mt-2 text-sm text-success-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    이메일 인증이 완료되었습니다
                  </p>
                )}
              </div>

              {/* 이름 입력 */}
              <Input
                label={<span>이름 <span className="text-error-500">*</span></span>}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="실명을 입력하세요"
                maxLength={REGISTER_INPUT_LIMITS.name}
                autoComplete="name"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              {/* 학번 입력 */}
              <Input
                label={<span>학번 <span className="text-error-500">*</span></span>}
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleStudentIdChange}
                error={errors.studentId}
                maxLength={REGISTER_INPUT_LIMITS.studentId}
                placeholder="2024123456"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                }
              />

              {/* 비밀번호 입력 */}
              <div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    비밀번호 <span className="text-error-500">*</span> <span className="text-gray-500 font-normal">(8-20자, 2가지 이상 조합)</span>
                  </label>
                </div>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  maxLength={INPUT_LIMITS.password}
                  error={errors.password}
                  placeholder="********"
                  autoComplete="new-password"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
                {formData.password && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator
                      password={formData.password}
                      showLabel={true}
                      showPercentage={false}
                    />
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <Input
                  label={<span>비밀번호 확인 <span className="text-error-500">*</span></span>}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  maxLength={INPUT_LIMITS.password}
                  error={errors.confirmPassword}
                  placeholder="********"
                  autoComplete="new-password"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                {formData.confirmPassword && formData.password && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-2 text-sm text-success-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    비밀번호가 일치합니다
                  </p>
                )}
              </div>

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
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              ← 홈으로 돌아가기
            </Link>
          </div>

          {/* 개발 모드: 테스트 버튼들 */}
          {isDevelopment && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestEmailDuplicate}
              >
                🧪 이메일 중복 테스트
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillForm}
              >
                ✏️ 자동 입력
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 이메일 인증 모달 */}
      {showVerificationModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setShowVerificationModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-lg shadow-xl max-w-md w-full animate-slide-up sm:animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일용 드래그 핸들 */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">이메일 인증</h3>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

            <p className="text-sm text-gray-600 mb-4 text-center">
              <span className="font-medium text-primary-600">{formData.email}</span>으로<br />
              인증번호를 발송했습니다
            </p>

            {/* 성공 메시지 */}
            {verificationSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {verificationSuccess}
                </p>
              </div>
            )}

            {/* 에러 메시지 */}
            {verificationError && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700">{verificationError}</p>
              </div>
            )}

            {/* 인증번호 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                인증번호 6자리를 입력하세요
              </label>
              <div className="flex justify-center gap-2 mb-3">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={timeLeft === 0 || attemptsLeft === 0}
                    className={`w-10 h-12 text-center text-xl font-bold border-2 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${verificationError ? 'border-error-500 shake' :
                        verificationCode.every(d => d !== '') ? 'border-green-500' :
                        'border-gray-300 focus:border-primary-500'}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* 타이머 */}
            <div className={`text-center mb-4 ${getTimerColor()}`}>
              {timeLeft > 0 ? (
                <p className="text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  남은 시간: {formatTime(timeLeft)}
                </p>
              ) : (
                <div>
                  <p className="font-bold text-sm mb-1">❌ 인증시간이 만료되었습니다</p>
                  <p className="text-xs">새로운 인증번호를 요청하세요</p>
                </div>
              )}
            </div>

            {/* 재전송 */}
            <div className="text-center text-sm mb-4">
              <p className="text-gray-600 mb-2">인증번호를 받지 못하셨나요?</p>
              {canResend && timeLeft > 0 && attemptsLeft > 0 ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                >
                  재전송
                </button>
              ) : (
                <span className="text-gray-400">
                  재전송 ({resendCooldown}초 후 가능)
                </span>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default StudentSignupPage
