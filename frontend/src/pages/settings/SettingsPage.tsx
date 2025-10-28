import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/common/ToastContext'
import { useFont } from '@/contexts/FontContext'
import type { FontType } from '@/contexts/FontContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'
import { INPUT_LIMITS } from '@/utils/inputValidation'
import { validatePassword } from '@/utils/passwordValidation'
import {
  validateName,
  validateEmail,
  validatePhone,
  validateDepartment,
  validateTextField,
  FORM_INPUT_LIMITS,
} from '@/utils/formValidation'

const SettingsPage = () => {
  const { user, token, updateUser } = useAuth()
  const { addToast } = useToast()
  const { currentFont, setFont } = useFont()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'appearance'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 프로필 편집
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
  })

  const [profileErrors, setProfileErrors] = useState({
    name: '',
    email: '',
    studentId: '',
    phone: '',
    department: '',
    bio: '',
  })

  // user 정보 변경 시 프로필 폼 업데이트
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        phone: user.phone || '',
        department: user.department || '',
        studentId: user.studentId || '',
      })
    }
  }, [user])

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

  // 프로필 유효성 검사 및 핸들러
  const validateProfileForm = () => {
    const newErrors = { name: '', email: '', studentId: '', phone: '', department: '', bio: '' }

    // 이름 검증
    const nameError = validateName(profileForm.name)
    if (nameError) {
      newErrors.name = nameError
    }

    // 이메일 검증
    const emailError = validateEmail(profileForm.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // 전화번호 검증 (선택)
    if (profileForm.phone) {
      const phoneError = validatePhone(profileForm.phone, false)
      if (phoneError) {
        newErrors.phone = phoneError
      }
    }

    // 소속/학과 검증 (선택)
    const departmentError = validateDepartment(profileForm.department, false)
    if (departmentError) {
      newErrors.department = departmentError
    }

    // 자기소개 검증 (선택)
    const bioError = validateTextField(profileForm.bio, '자기소개', 500, false)
    if (bioError) {
      newErrors.bio = bioError
    }

    setProfileErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== '')
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProfileForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const isDev = import.meta.env.DEV

      if (isDev) {
        // 개발 모드: 모든 과정이 성공한 것으로 처리
        await new Promise((resolve) => setTimeout(resolve, 800))

        // AuthContext 업데이트
        if (user) {
          updateUser({
            ...user,
            ...profileForm,
          })
        }

        // Toast 성공 알림
        addToast('프로필이 성공적으로 저장되었습니다', { variant: 'success' })

        // 편집 모드에서 뷰 모드로 전환
        setIsEditing(false)
      } else {
        // 프로덕션 모드: 실제 API 요청
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profileForm),
        })

        const data = await response.json()

        if (data.status === 'success') {
          if (data.data?.user) {
            updateUser(data.data.user)
          }
          addToast('프로필이 성공적으로 저장되었습니다', { variant: 'success' })
          setIsEditing(false)
          setMessage(null)
        } else {
          addToast(data.message || '프로필 업데이트에 실패했습니다', { variant: 'error' })
        }
      }
    } catch (error: any) {
      addToast('서버 오류가 발생했습니다', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileCancel = () => {
    setIsEditing(false)
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
    })
    setProfileErrors({ name: '', email: '', phone: '', department: '', bio: '' })
    setMessage(null)
  }

  // 실시간 유효성 검사
  const handleNameChange = (value: string) => {
    setProfileForm({ ...profileForm, name: value })

    // 유효성 검사
    if (!/^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]*$/.test(value)) {
      setProfileErrors({ ...profileErrors, name: '한글, 영문, 숫자, 공백만 입력 가능합니다' })
    } else if (value.trim().length > 0 && value.trim().length < 2) {
      setProfileErrors({ ...profileErrors, name: '이름은 최소 2자 이상이어야 합니다' })
    } else if (value.trim().length > 50) {
      setProfileErrors({ ...profileErrors, name: '이름은 최대 50자까지 입력 가능합니다' })
    } else {
      setProfileErrors({ ...profileErrors, name: '' })
    }
  }

  const handleStudentIdChange = (value: string) => {
    setProfileForm({ ...profileForm, studentId: value })

    // 유효성 검사
    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      setProfileErrors({ ...profileErrors, studentId: '영문과 숫자만 입력 가능합니다' })
    } else if (value.length > 20) {
      setProfileErrors({ ...profileErrors, studentId: '학번은 최대 20자까지 입력 가능합니다' })
    } else {
      setProfileErrors({ ...profileErrors, studentId: '' })
    }
  }

  const handlePhoneChange = (value: string) => {
    setProfileForm({ ...profileForm, phone: value })

    // 유효성 검사
    if (!/^[0-9-]*$/.test(value)) {
      setProfileErrors({ ...profileErrors, phone: '숫자와 하이픈(-)만 입력 가능합니다' })
    } else {
      setProfileErrors({ ...profileErrors, phone: '' })
    }
  }

  const handleDepartmentChange = (value: string) => {
    setProfileForm({ ...profileForm, department: value })

    // 유효성 검사
    if (!/^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]*$/.test(value)) {
      setProfileErrors({ ...profileErrors, department: '한글, 영문, 숫자, 공백만 입력 가능합니다' })
    } else if (value.trim().length > 100) {
      setProfileErrors({ ...profileErrors, department: '소속은 최대 100자까지 입력 가능합니다' })
    } else {
      setProfileErrors({ ...profileErrors, department: '' })
    }
  }

  const handleBioChange = (value: string) => {
    setProfileForm({ ...profileForm, bio: value })

    if (value.trim().length > 500) {
      setProfileErrors({ ...profileErrors, bio: '최대 500자까지 입력 가능합니다' })
    } else {
      setProfileErrors({ ...profileErrors, bio: '' })
    }
  }

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
      const isDev = import.meta.env.DEV

      if (isDev) {
        // 개발 모드: 모든 과정이 성공한 것으로 처리
        await new Promise((resolve) => setTimeout(resolve, 800))

        addToast('비밀번호가 성공적으로 변경되었습니다', { variant: 'success' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        // 프로덕션 모드: 실제 API 요청
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
          addToast('비밀번호가 성공적으로 변경되었습니다', { variant: 'success' })
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
          addToast(data.message || '비밀번호 변경에 실패했습니다', { variant: 'error' })
        }
      }
    } catch (error: any) {
      addToast('서버 오류가 발생했습니다', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const isDev = import.meta.env.DEV

      if (isDev) {
        // 개발 모드: 모든 과정이 성공한 것으로 처리
        await new Promise((resolve) => setTimeout(resolve, 800))

        addToast('알림 설정이 저장되었습니다', { variant: 'success' })
      } else {
        // 프로덕션 모드: 실제 API 요청
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
          addToast('알림 설정이 저장되었습니다', { variant: 'success' })
        } else {
          addToast(data.message || '설정 저장에 실패했습니다', { variant: 'error' })
        }
      }
    } catch (error: any) {
      addToast('서버 오류가 발생했습니다', { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  // 프로필 폼 유효성 검사 (저장 버튼 활성화 조건)
  const isProfileFormValid = () => {
    // 필수 필드: 이름, 이메일
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      return false
    }

    // 학생인 경우 학번 필수
    if (user?.role === 'student' && !profileForm.studentId.trim()) {
      return false
    }

    // 에러가 하나라도 있으면 false
    if (Object.values(profileErrors).some(error => error !== '')) {
      return false
    }

    return true
  }

  const tabs = [
    { id: 'profile' as const, name: '내 프로필', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
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
    { id: 'appearance' as const, name: '기타 설정', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <div className="space-y-6">
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
                {/* 프로필 탭 */}
                {activeTab === 'profile' && (
                  <div>
                    {/* 프로필 헤더 */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-3xl">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          <Badge
                            variant={user?.role === 'admin' ? 'purple' : user?.role === 'professor' ? 'blue' : 'success'}
                            className="mt-2"
                          >
                            {user?.role === 'admin' ? '관리자' : user?.role === 'professor' ? '교수' : '학생'}
                          </Badge>
                        </div>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          }
                        >
                          편집
                        </Button>
                      )}
                    </div>

                    {/* 프로필 폼 */}
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 이름 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            이름 <span className="text-error-500">*</span>
                          </label>
                          <Input
                            value={profileForm.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            disabled={!isEditing}
                            error={profileErrors.name}
                            maxLength={50}
                          />
                          {isEditing && (
                            <p className="mt-1 text-xs text-gray-500 text-right">
                              {profileForm.name.length} / 50
                            </p>
                          )}
                        </div>

                        {/* 이메일(계정) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            이메일(계정) <span className="text-error-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            disabled={true}
                            error={profileErrors.email}
                            helperText="이메일은 수정할 수 없습니다"
                          />
                        </div>

                        {/* 학번 (학생만) */}
                        {user?.role === 'student' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              학번 <span className="text-error-500">*</span>
                            </label>
                            <Input
                              value={profileForm.studentId}
                              onChange={(e) => handleStudentIdChange(e.target.value)}
                              placeholder="2024123456"
                              disabled={!isEditing}
                              error={profileErrors.studentId}
                              maxLength={20}
                            />
                            {isEditing && (
                              <p className="mt-1 text-xs text-gray-500 text-right">
                                {profileForm.studentId.length} / 20
                              </p>
                            )}
                          </div>
                        )}

                        {/* 소속 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            소속
                          </label>
                          <Input
                            value={profileForm.department}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            placeholder="입력해 주세요."
                            disabled={!isEditing}
                            error={profileErrors.department}
                            maxLength={100}
                          />
                          {isEditing && (
                            <p className="mt-1 text-xs text-gray-500 text-right">
                              {profileForm.department.length} / 100
                            </p>
                          )}
                        </div>

                        {/* 연락처 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            연락처
                          </label>
                          <Input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="입력해 주세요."
                            disabled={!isEditing}
                            error={profileErrors.phone}
                            maxLength={13}
                          />
                          {isEditing && (
                            <p className="mt-1 text-xs text-gray-500 text-right">
                              {profileForm.phone.length} / 13
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 자기소개 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          자기소개
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => handleBioChange(e.target.value)}
                          disabled={!isEditing}
                          rows={4}
                          maxLength={500}
                          className={`block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 px-4 py-2 text-base ${
                            profileErrors.bio
                              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                          placeholder="자신에 대해 소개해 주세요."
                        />
                        {profileErrors.bio && (
                          <p className="mt-1 text-sm text-error-600">{profileErrors.bio}</p>
                        )}
                        {isEditing && (
                          <p className="mt-1 text-xs text-gray-500 text-right">
                            {profileForm.bio.length} / 500
                          </p>
                        )}
                      </div>

                      {/* 버튼 */}
                      {isEditing && (
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleProfileCancel}
                            disabled={isLoading}
                          >
                            취소
                          </Button>
                          <Button
                            type="submit"
                            loading={isLoading}
                            disabled={!isProfileFormValid()}
                          >
                            저장
                          </Button>
                        </div>
                      )}
                    </form>

                    {/* 계정 정보 */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">가입일</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">이메일 인증</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {user?.emailVerified ? '인증 완료' : '미인증'}
                            </p>
                          </div>
                          {!user?.emailVerified && (
                            <Button variant="outline" size="sm">
                              인증 메일 발송
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">역할</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {user?.role === 'admin' ? '관리자' : user?.role === 'professor' ? '교수' : '학생'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
