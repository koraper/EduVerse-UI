import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card } from '@/components/common'
import LandingHeader from '@/pages/landing/LandingHeader'

const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // 회원가입 페이지에서 전달받은 데이터
  const signupData = location.state?.signupData
  const email = signupData?.email || ''

  // 6자리 인증번호 입력 상태
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  // 타이머 상태 (10분 = 600초)
  const [timeLeft, setTimeLeft] = useState(600)
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(30)

  // Input refs for focus management
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 개발 환경 여부
  const isDevelopment = import.meta.env.DEV

  // 회원가입 데이터 없이 접근한 경우 리다이렉트
  useEffect(() => {
    if (!signupData) {
      navigate('/student/signup')
    }
  }, [signupData, navigate])

  // 10분 타이머
  useEffect(() => {
    if (timeLeft <= 0) return

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
  }, [timeLeft])

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (resendCooldown <= 0) {
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
  }, [resendCooldown])

  // 인증번호 입력 처리
  const handleCodeChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)
    setError(null)

    // 값을 입력하면 다음 칸으로 자동 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 6자리 모두 입력되면 자동 제출
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''))
    }
  }

  // Backspace 키 처리
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Paste 처리
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...code]
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }

    setCode(newCode)

    // 마지막 입력된 칸으로 포커스 이동
    const lastIndex = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()

    // 6자리 모두 입력되면 자동 제출
    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  // 인증번호 검증
  const handleVerify = async (verificationCode: string) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // 개발 환경: 고정 인증번호 123456
      if (isDevelopment && verificationCode === '123456') {
        setSuccessMessage('이메일 인증이 완료되었습니다')

        // 회원가입 완료 및 자동 로그인
        setTimeout(async () => {
          // 실제로는 백엔드에 회원가입 요청을 보내야 함
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...signupData,
              emailVerified: true
            })
          })

          if (!response.ok) {
            throw new Error('회원가입에 실패했습니다')
          }

          const data = await response.json()

          // 자동 로그인
          login(data.user, data.token)

          // 학생 대시보드로 리다이렉트 (신규 가입자 표시)
          navigate('/student/dashboard', {
            state: { fromEmailVerification: true }
          })
        }, 1500)

        return
      }

      // 실제 API 호출
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '인증번호가 일치하지 않습니다')
      }

      const data = await response.json()

      setSuccessMessage('이메일 인증이 완료되었습니다')

      // 회원가입 완료 및 자동 로그인
      setTimeout(() => {
        login(data.user, data.token)
        navigate('/student/dashboard', {
          state: { fromEmailVerification: true }
        })
      }, 1500)

    } catch (err: any) {
      setAttemptsLeft(prev => prev - 1)

      if (attemptsLeft <= 1) {
        setError('인증 시도 횟수를 초과했습니다. 새로운 인증번호를 요청하세요.')
      } else {
        setError(`${err.message} (${attemptsLeft - 1}회 남음)`)
      }

      // 인증번호 초기화 및 첫 번째 칸으로 포커스
      setCode(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  // 재전송
  const handleResend = async () => {
    if (!canResend) return

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('인증번호 재전송에 실패했습니다')
      }

      setSuccessMessage('새로운 인증번호를 발송했습니다')
      setCanResend(false)
      setResendCooldown(30)
      setTimeLeft(600) // 타이머 리셋
      setAttemptsLeft(5) // 시도 횟수 리셋
      setCode(Array(6).fill(''))
      inputRefs.current[0]?.focus()

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // 개발 환경: 자동 입력
  const handleAutoFill = () => {
    const devCode = '123456'.split('')
    setCode(devCode)
    handleVerify('123456')
  }

  // 타이머 포맷팅 (MM:SS)
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

  const isCodeComplete = code.every(digit => digit !== '')

  return (
    <>
      <LandingHeader />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full min-w-[500px] space-y-8">
          {/* 헤더 */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">이메일 인증</h2>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-primary-600">{email}</span>으로<br />
              인증번호를 발송했습니다
            </p>
          </div>

          <Card className="p-8">
            {/* 성공 메시지 */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">{successMessage}</p>
                    <p className="text-xs text-green-700 mt-1">잠시 후 자동으로 로그인됩니다...</p>
                  </div>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            {/* 인증번호 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                인증번호 6자리를 입력하세요
              </label>

              <div className="flex justify-center gap-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={timeLeft === 0 || attemptsLeft === 0 || isSubmitting}
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${error ? 'border-error-500 shake' :
                        isCodeComplete ? 'border-green-500' :
                        'border-gray-300 focus:border-primary-500'}
                    `}
                  />
                ))}
              </div>

              {isCodeComplete && !error && (
                <p className="text-sm text-green-600 text-center flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  인증번호가 입력되었습니다
                </p>
              )}
            </div>

            {/* 타이머 */}
            <div className={`text-center mb-6 ${getTimerColor()}`}>
              {timeLeft > 0 ? (
                <p className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  남은 시간: {formatTime(timeLeft)}
                </p>
              ) : (
                <div>
                  <p className="font-bold mb-2">❌ 인증시간이 만료되었습니다</p>
                  <p className="text-sm">새로운 인증번호를 요청하세요</p>
                </div>
              )}
            </div>

            {/* 인증 완료 버튼 */}
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => handleVerify(code.join(''))}
              disabled={!isCodeComplete || timeLeft === 0 || attemptsLeft === 0 || isSubmitting}
              loading={isSubmitting}
            >
              인증 완료
            </Button>

            {/* 재전송 */}
            <div className="mt-4 text-center text-sm">
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

            {/* 개발 환경 전용 */}
            {isDevelopment && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 mb-2">⚙️ 개발 모드</p>
                <p className="text-xs text-yellow-600 mb-3">고정 인증번호: 123456</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAutoFill}
                >
                  자동 입력
                </Button>
              </div>
            )}

            {/* 홈으로 돌아가기 */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
                ← 홈으로 돌아가기
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  )
}

export default VerifyEmailPage
