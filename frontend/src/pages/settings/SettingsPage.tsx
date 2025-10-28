import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFont } from '@/contexts/FontContext'
import type { FontType } from '@/contexts/FontContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'
import { INPUT_LIMITS } from '@/utils/inputValidation'
import { validatePassword } from '@/utils/passwordValidation'

const SettingsPage = () => {
  const { token } = useAuth()
  const { currentFont, setFont } = useFont()
  const [activeTab, setActiveTab] = useState<'password' | 'notifications' | 'appearance'>('password')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 비밀번호 변경
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''))

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    gradeNotifications: true,
    courseUpdates: true,
    weeklyDigest: false,
  })

  const validatePasswordForm = () => {
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' }
    let isValid = true

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요'
      isValid = false
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요'
      isValid = false
    } else {
      // 새 비밀번호 정책 검증
      const validation = validatePassword(passwordForm.newPassword)
      if (!validation.valid) {
        // 첫 번째 에러 메시지 표시
        newErrors.newPassword = validation.errors[0] || '비밀번호가 정책을 충족하지 않습니다'
        isValid = false
      }
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
      isValid = false
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      isValid = false
    }

    setPasswordErrors(newErrors)
    return isValid
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: data.message || '비밀번호 변경에 실패했습니다' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(notificationSettings),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setMessage({ type: 'success', text: '알림 설정이 저장되었습니다' })
      } else {
        setMessage({ type: 'error', text: data.message || '설정 저장에 실패했습니다' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다' })
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'password' as const, name: '비밀번호 변경', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
    { id: 'notifications' as const, name: '알림 설정', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
    { id: 'appearance' as const, name: '글꼴 설정', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )},
  ]

  const fontOptions: Array<{ value: FontType; name: string; description: string }> = [
    { value: 'pretendard', name: 'Pretendard (Noto Sans KR)', description: '깔끔하고 균형잡힌 현대적 폰트' },
    { value: 'poppins', name: 'Poppins', description: '부드럽고 친근한 산세리프 폰트' },
    { value: 'nanum-pen', name: 'Nanum Pen Script', description: '손글씨 같은 편안한 서예 폰트' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">설정</h1>
          <p className="mt-1 text-sm text-gray-600">계정 보안 및 알림 설정을 관리하세요</p>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-success-50 text-success-800 border border-success-200'
                : 'bg-error-50 text-error-800 border border-error-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드 탭 */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMessage(null)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={activeTab === tab.id ? 'text-primary-600' : 'text-gray-500'}>
                        {tab.icon}
                      </span>
                      <span className="text-sm">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </Card>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                {/* 비밀번호 변경 탭 */}
                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">비밀번호 변경</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          현재 비밀번호 <span className="text-error-500">*</span>
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          maxLength={INPUT_LIMITS.password}
                          error={passwordErrors.currentPassword}
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호 <span className="text-error-500">*</span>
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => {
                            const newPass = e.target.value
                            setPasswordForm({ ...passwordForm, newPassword: newPass })
                            setPasswordValidation(validatePassword(newPass))
                          }}
                          maxLength={INPUT_LIMITS.password}
                          error={passwordErrors.newPassword}
                          placeholder="8자 이상, 2가지 이상의 문자 조합"
                        />
                        {passwordForm.newPassword && (
                          <div className="mt-3">
                            <PasswordStrengthIndicator
                              password={passwordForm.newPassword}
                              showLabel={true}
                              showPercentage={true}
                            />
                          </div>
                        )}
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium mb-2">정책 요구사항:</p>
                          <ul className="text-xs text-blue-600 space-y-1">
                            <li className={`flex items-center ${passwordValidation.complexity.hasLowercase && passwordValidation.complexity.hasUppercase && passwordValidation.complexity.hasNumber && passwordValidation.complexity.hasSpecialChar ? 'text-success-600' : 'text-gray-600'}`}>
                              <span className="mr-2">✓</span> 8-20자 범위
                            </li>
                            <li className={`flex items-center ${passwordValidation.complexity.complexityCount >= 2 ? 'text-success-600' : 'text-gray-600'}`}>
                              <span className="mr-2">✓</span> 영문 대소문자+숫자+특수문자 중 2가지 이상 조합 ({passwordValidation.complexity.complexityCount}/4)
                            </li>
                            <li className="flex items-center text-gray-600">
                              <span className="mr-2">✓</span> 연속된 문자 3개 이상 불가
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          비밀번호 확인 <span className="text-error-500">*</span>
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          }
                          maxLength={INPUT_LIMITS.password}
                          error={passwordErrors.confirmPassword}
                          placeholder="새 비밀번호를 다시 입력하세요"
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <Button type="submit" loading={isLoading}>
                          비밀번호 변경
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 알림 설정 탭 */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h2>
                    <form onSubmit={handleNotificationSubmit} className="space-y-6">
                      <div className="space-y-4">
                        {/* 이메일 알림 */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">이메일 알림</p>
                            <p className="text-xs text-gray-500 mt-1">
                              모든 알림을 이메일로 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  emailNotifications: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        {/* 과제 알림 */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">과제 마감 알림</p>
                            <p className="text-xs text-gray-500 mt-1">
                              과제 마감일이 다가오면 알림을 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.assignmentReminders}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  assignmentReminders: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        {/* 성적 알림 */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">성적 알림</p>
                            <p className="text-xs text-gray-500 mt-1">
                              새로운 성적이 등록되면 알림을 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.gradeNotifications}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  gradeNotifications: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        {/* 과목 업데이트 */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">과목 업데이트 알림</p>
                            <p className="text-xs text-gray-500 mt-1">
                              수강 과목에 새로운 공지나 자료가 등록되면 알림을 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.courseUpdates}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  courseUpdates: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        {/* 주간 리포트 */}
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">주간 학습 리포트</p>
                            <p className="text-xs text-gray-500 mt-1">
                              매주 월요일에 지난주 학습 활동 요약을 받습니다
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.weeklyDigest}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  weeklyDigest: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <Button type="submit" loading={isLoading}>
                          설정 저장
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 글꼴 설정 탭 */}
                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">글꼴 설정</h2>
                    <div className="space-y-4">
                      {fontOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => setFont(option.value)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            currentFont === option.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-all ${
                                currentFont === option.value
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {currentFont === option.value && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  currentFont === option.value
                                    ? 'text-primary-700'
                                    : 'text-gray-900'
                                }`}
                                style={{ fontFamily: option.value === 'pretendard' ? "'Noto Sans KR', system-ui, sans-serif" : option.value === 'poppins' ? "'Poppins', system-ui, sans-serif" : "'Nanum Pen Script', cursive" }}
                              >
                                {option.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                              <p className="text-sm mt-3" style={{ fontFamily: option.value === 'pretendard' ? "'Noto Sans KR', system-ui, sans-serif" : option.value === 'poppins' ? "'Poppins', system-ui, sans-serif" : "'Nanum Pen Script', cursive" }}>
                                미리보기: 안녕하세요, 이것은 {option.name} 폰트입니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-primary-700">
                        <span className="font-medium">💡 팁:</span> 선택한 글꼴은 자동으로 저장되며, 브라우저를 다시 열어도 유지됩니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
