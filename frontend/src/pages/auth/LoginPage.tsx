import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Input, Card } from '@/components/common'
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'
import { INPUT_LIMITS } from '@/utils/inputValidation'
import { validatePassword } from '@/utils/passwordValidation'
import LandingHeader from '@/pages/landing/LandingHeader'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, updateUser } = useAuth()
  const { currentTheme } = useTheme()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // 개발 환경 여부
  const isDevelopment = import.meta.env.DEV

  // 테스트 계정 정보 자동 입력
  useEffect(() => {
    const state = location.state as { testAccount?: { email: string; password: string } }
    if (state?.testAccount) {
      setFormData({
        email: state.testAccount.email,
        password: state.testAccount.password,
      })
    }
  }, [location.state])

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    }

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else {
      // 로그인 시 기본 길이 검증만 수행 (정책 전체 검증은 회원가입/변경 시에만)
      if (formData.password.length < 8) {
        newErrors.password = '비밀번호는 8자 이상이어야 합니다'
      }
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 개발 환경: 학생만 로그인 bypass (관리자/교수는 실제 로그인)
      const isAdminOrProfessor = formData.email.includes('admin') || formData.email.includes('professor')

      if (isDevelopment && !isAdminOrProfessor) {
        // 약간의 로딩 시간 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500))

        // 더미 학생 사용자 설정
        const dummyUser = {
          id: 1,
          email: formData.email || 'student@test.com',
          name: '테스트 학생',
          role: 'student' as const,
          emailVerified: true,
          studentId: '20240001'
        }

        // AuthContext에 사용자 정보 설정
        updateUser(dummyUser)

        // localStorage에도 저장
        localStorage.setItem('auth_token', 'dev-token-123')
        localStorage.setItem('auth_user', JSON.stringify(dummyUser))

        // 학생 대시보드로 바로 이동
        navigate('/student/dashboard')
        return
      }

      // 관리자/교수 또는 프로덕션 환경: 실제 로그인 API 호출
      const user = await login(formData.email, formData.password)

      // 역할별 대시보드로 리다이렉트
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'professor') {
        navigate('/professor/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (error: any) {
      setApiError(error.message || '로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 입력시 에러 메시지 초기화
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  return (
    <>
      {/* 랜딩 헤더 */}
      <LandingHeader />

      <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-primary-50 to-secondary-50'
      }`}>
        <div className="max-w-md w-full min-w-[500px]">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              E
            </div>
          </div>
          <h2 className={`text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>EduVerse에 로그인</h2>
          <p className={`mt-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>계정에 로그인하여 학습을 시작하세요</p>
        </div>

        {/* 로그인 폼 카드 */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="example@eduverse.com"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            {/* 비밀번호 입력 */}
            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.password}
              error={errors.password}
              placeholder="********"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* 계정 찾기 & 비밀번호 찾기 */}
            <div className="flex justify-end gap-4 text-sm">
              <button
                type="button"
                onClick={() => {
                  // TODO: 계정(이메일) 찾기 페이지로 이동
                  alert('계정 찾기 기능은 추후 구현 예정입니다')
                }}
                className={`font-medium ${currentTheme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
              >
                계정(이메일) 찾기
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: 비밀번호 찾기 페이지로 이동
                  alert('비밀번호 찾기 기능은 추후 구현 예정입니다')
                }}
                className={`font-medium ${currentTheme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
              >
                비밀번호 찾기
              </button>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              로그인
            </Button>

            {/* 회원가입 링크 */}
            <div className="text-center text-sm">
              <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>계정이 없으신가요? </span>
              <Link to="/student/signup" className={`font-medium ${currentTheme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}>
                회원가입
              </Link>
            </div>

          </form>
        </Card>
        </div>
      </div>
    </>
  )
}

export default LoginPage
