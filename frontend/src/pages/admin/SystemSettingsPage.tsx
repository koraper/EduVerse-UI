import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Button from '@/components/common/Button'
import { INPUT_LIMITS, validateInput } from '@/utils/inputValidation'

const SystemSettingsPage = () => {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  // 폼 상태
  const [formData, setFormData] = useState({
    appName: 'EduVerse',
    appDescription: 'EduVerse - 프로그래밍 교육 통합 플랫폼',
    smtpServer: 'smtp.gmail.com',
    senderEmail: 'noreply@eduverse.com',
    senderName: 'EduVerse Admin',
    maxUploadSize: '10',
    sessionTimeout: '30',
    passwordExpiry: '90',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lengths, setLengths] = useState<Record<string, number>>({
    appName: formData.appName.length,
    appDescription: formData.appDescription.length,
    senderName: formData.senderName.length,
  })

  // API 함수: 설정 조회
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (!response.ok) {
        throw new Error(`설정 조회 실패: ${response.status}`)
      }

      const data = await response.json()
      if (data.status === 'success' && data.data) {
        const settings = data.data
        setFormData({
          appName: settings.appName || 'EduVerse',
          appDescription: settings.appDescription || 'EduVerse - 프로그래밍 교육 통합 플랫폼',
          smtpServer: settings.smtpServer || 'smtp.gmail.com',
          senderEmail: settings.senderEmail || 'noreply@eduverse.com',
          senderName: settings.senderName || 'EduVerse Admin',
          maxUploadSize: settings.maxUploadSize?.toString() || '10',
          sessionTimeout: settings.sessionTimeout?.toString() || '30',
          passwordExpiry: settings.passwordExpiry?.toString() || '90',
        })
        setLengths({
          appName: settings.appName?.length || 'EduVerse'.length,
          appDescription: settings.appDescription?.length || 'EduVerse - 프로그래밍 교육 통합 플랫폼'.length,
          senderName: settings.senderName?.length || 'EduVerse Admin'.length,
        })
      }
    } catch (error) {
      console.error('설정 조회 오류:', error)
      addToast('설정을 불러올 수 없습니다', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  // API 함수: 설정 저장
  const saveSettings = async (data: typeof formData) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          appName: data.appName,
          appDescription: data.appDescription,
          smtpServer: data.smtpServer,
          senderEmail: data.senderEmail,
          senderName: data.senderName,
          maxUploadSize: parseInt(data.maxUploadSize),
          sessionTimeout: parseInt(data.sessionTimeout),
          passwordExpiry: parseInt(data.passwordExpiry),
        }),
      })

      if (!response.ok) {
        throw new Error(`설정 저장 실패: ${response.status}`)
      }

      const result = await response.json()
      if (result.status === 'success') {
        return result.data
      } else {
        throw new Error(result.message || '설정 저장에 실패했습니다')
      }
    } catch (error) {
      console.error('설정 저장 오류:', error)
      throw error
    }
  }

  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading) {
      return
    }

    // 관리자가 아니면 역할별 대시보드로 리다이렉트
    if (user && user.role !== 'admin') {
      if (user.role === 'professor') {
        navigate('/professor/dashboard')
      } else if (user.role === 'student') {
        navigate('/student/dashboard')
      }
      return
    }

    // 비인증 사용자 리다이렉트
    if (!user) {
      navigate('/login')
      return
    }

    // 관리자인 경우 설정값 로드
    if (user.role === 'admin') {
      fetchSettings()
    }
  }, [user, authLoading, navigate])

  // 입력값 변경
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // 길이 업데이트
    if (['appName', 'appDescription', 'senderName'].includes(name)) {
      setLengths((prev) => ({
        ...prev,
        [name]: value.length,
      }))
    }
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 앱 이름
    const appNameValidation = validateInput(formData.appName, {
      maxLength: INPUT_LIMITS.settings.appName,
      required: true,
    })
    if (!appNameValidation.valid) {
      newErrors.appName = appNameValidation.error || ''
    }

    // 앱 설명
    const appDescValidation = validateInput(formData.appDescription, {
      maxLength: INPUT_LIMITS.settings.appDescription,
    })
    if (!appDescValidation.valid) {
      newErrors.appDescription = appDescValidation.error || ''
    }

    // SMTP 서버
    if (!formData.smtpServer.trim()) {
      newErrors.smtpServer = '필수 입력 항목입니다'
    }

    // 발신자 이메일
    const emailValidation = validateInput(formData.senderEmail, {
      maxLength: INPUT_LIMITS.settings.senderEmail,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: true,
    })
    if (!emailValidation.valid) {
      newErrors.senderEmail = emailValidation.error || ''
    }

    // 발신자 이름
    const senderNameValidation = validateInput(formData.senderName, {
      maxLength: INPUT_LIMITS.settings.senderName,
      required: true,
    })
    if (!senderNameValidation.valid) {
      newErrors.senderName = senderNameValidation.error || ''
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 저장
  const handleSave = async () => {
    if (!validateForm()) {
      addToast('입력 오류가 있습니다. 확인 후 다시 시도해주세요.', {
        variant: 'warning',
      })
      return
    }

    setIsSaving(true)
    try {
      // 실제 API 호출
      await saveSettings(formData)
      addToast('설정이 저장되었습니다', { variant: 'success' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 저장에 실패했습니다'
      addToast(errorMessage, { variant: 'error' })
      console.error('설정 저장 에러:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 초기화
  const handleReset = () => {
    setFormData({
      appName: 'EduVerse',
      appDescription: 'EduVerse - 프로그래밍 교육 통합 플랫폼',
      smtpServer: 'smtp.gmail.com',
      senderEmail: 'noreply@eduverse.com',
      senderName: 'EduVerse Admin',
      maxUploadSize: '10',
      sessionTimeout: '30',
      passwordExpiry: '90',
    })
    setErrors({})
    addToast('설정이 초기화되었습니다', { variant: 'info' })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">시스템 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            EduVerse 시스템의 전역 설정을 관리하세요
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">설정을 불러오는 중입니다...</p>
            </div>
          </div>
        ) : (
          <>
        {/* 기본 설정 */}
        <Card title="기본 설정">
          <div className="p-6 space-y-4">
            <Input
              label="앱 이름"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.settings.appName}
              showLengthCounter={true}
              onLengthChange={(length) =>
                setLengths((prev) => ({ ...prev, appName: length }))
              }
              error={errors.appName}
              helperText="사용자에게 표시될 애플리케이션 이름"
            />

            <Textarea
              label="앱 설명"
              name="appDescription"
              value={formData.appDescription}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.settings.appDescription}
              showLengthCounter={true}
              onLengthChange={(length) =>
                setLengths((prev) => ({ ...prev, appDescription: length }))
              }
              error={errors.appDescription}
              helperText="애플리케이션의 간단한 설명"
              rows={3}
            />
          </div>
        </Card>

        {/* 이메일 설정 */}
        <Card title="이메일 설정">
          <div className="p-6 space-y-4">
            <Input
              label="SMTP 서버"
              name="smtpServer"
              type="text"
              value={formData.smtpServer}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.settings.smtpServer}
              error={errors.smtpServer}
              helperText="예: smtp.gmail.com"
            />

            <Input
              label="발신자 이메일"
              name="senderEmail"
              type="email"
              value={formData.senderEmail}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.settings.senderEmail}
              error={errors.senderEmail}
              helperText="이메일 발송 시 사용될 발신자 주소"
            />

            <Input
              label="발신자 이름"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              maxLength={INPUT_LIMITS.settings.senderName}
              showLengthCounter={true}
              onLengthChange={(length) =>
                setLengths((prev) => ({ ...prev, senderName: length }))
              }
              error={errors.senderName}
              helperText="이메일에 표시될 발신자 이름"
            />
          </div>
        </Card>

        {/* 보안 설정 */}
        <Card title="보안 설정">
          <div className="p-6 space-y-4">
            <Input
              label="최대 업로드 용량 (MB)"
              name="maxUploadSize"
              type="number"
              value={formData.maxUploadSize}
              onChange={handleChange}
              helperText="파일 업로드 시 허용되는 최대 용량"
            />

            <Input
              label="세션 타임아웃 (분)"
              name="sessionTimeout"
              type="number"
              value={formData.sessionTimeout}
              onChange={handleChange}
              helperText="로그인 세션의 유지 시간"
            />

            <Input
              label="비밀번호 유효 기간 (일)"
              name="passwordExpiry"
              type="number"
              value={formData.passwordExpiry}
              onChange={handleChange}
              helperText="비밀번호 변경이 필요한 기간 (0 = 제한 없음)"
            />
          </div>
        </Card>

        {/* 작업 버튼 */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || isLoading}
          >
            초기화
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={isLoading}
          >
            저장
          </Button>
        </div>

        {/* 정보 */}
        <Card>
          <div className="p-6 bg-blue-50">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  입력 필드 길이 제한
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  각 입력 필드는 최대 글자 수 제한이 적용되어 있습니다. 글자 수
                  초과 시 자동으로 잘려집니다.
                </p>
              </div>
            </div>
          </div>
        </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default SystemSettingsPage
