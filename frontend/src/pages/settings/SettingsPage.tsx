import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/common/ToastContext'
import { useFont } from '@/contexts/FontContext'
import { useTheme } from '@/contexts/ThemeContext'
import type { FontType } from '@/contexts/FontContext'
import StudentLayout from '@/components/layout/StudentLayout'
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
} from '@/utils/formValidation'

const SettingsPage = () => {
  const { user, token, updateUser } = useAuth()
  const { addToast } = useToast()
  const { currentFont, setFont } = useFont()
  const { currentTheme, setTheme } = useTheme()
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
    setProfileErrors({ name: '', email: '', phone: '', department: '', bio: '', studentId: '' })
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

  const fontOptions: Array<{ value: FontType; name: string; description: string }> = [
    { value: 'pretendard', name: 'Pretendard (Noto Sans KR)', description: '깔끔하고 균형잡힌 현대적 폰트' },
    { value: 'poppins', name: 'Poppins', description: '부드럽고 친근한 산세리프 폰트' },
    { value: 'nanum-pen', name: 'Nanum Pen Script', description: '손글씨 같은 편안한 서예 폰트' },
  ]

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>설정</h1>
          <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>계정 보안 및 알림 설정을 관리하세요</p>
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

        <div>
            <Card>
              <div className="p-6">
                {/* 프로필 섹션 */}
                <div>
                    {/* 프로필 헤더 */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-3xl">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className={`text-xl font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</h2>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
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
                          <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            이름 <span className="text-error-500">*</span>
                          </label>
                          <Input
                            value={profileForm.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            disabled={!isEditing}
                            error={profileErrors.name}
                            maxLength={50}
                            leftIcon={
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            }
                          />
                          {isEditing && (
                            <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                              {profileForm.name.length} / 50
                            </p>
                          )}
                        </div>

                        {/* 이메일(계정) */}
                        <div>
                          <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            이메일(계정) <span className="text-error-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            disabled={true}
                            error={profileErrors.email}
                            helperText="이메일은 수정할 수 없습니다"
                            leftIcon={
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            }
                          />
                        </div>

                        {/* 학번 (학생만) */}
                        {user?.role === 'student' && (
                          <div>
                            <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              학번 <span className="text-error-500">*</span>
                            </label>
                            <Input
                              value={profileForm.studentId}
                              onChange={(e) => handleStudentIdChange(e.target.value)}
                              placeholder="2024123456"
                              disabled={!isEditing}
                              error={profileErrors.studentId}
                              maxLength={20}
                              leftIcon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                              }
                            />
                            {isEditing && (
                              <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                                {profileForm.studentId.length} / 20
                              </p>
                            )}
                          </div>
                        )}

                        {/* 소속 */}
                        <div>
                          <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            소속
                          </label>
                          <Input
                            value={profileForm.department}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            placeholder="입력해 주세요."
                            disabled={!isEditing}
                            error={profileErrors.department}
                            maxLength={100}
                            leftIcon={
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m11.581 0a2 2 0 100-4H9m0 0a2 2 0 110-4m11.581 8a2 2 0 100-4m-11.581 4a2 2 0 110-4m0 8v-2.5" />
                              </svg>
                            }
                          />
                          {isEditing && (
                            <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                              {profileForm.department.length} / 100
                            </p>
                          )}
                        </div>

                        {/* 연락처 */}
                        <div>
                          <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                            leftIcon={
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l2.498 8.756a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l8.756 2.498a1 1 0 00.684-.948V5a2 2 0 00-2-2h-2.28a1 1 0 00-.948.684m0 0L9.879 9.878m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.879 9.879" />
                              </svg>
                            }
                          />
                          {isEditing && (
                            <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                              {profileForm.phone.length} / 13
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 자기소개 */}
                      <div>
                        <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          자기소개
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => handleBioChange(e.target.value)}
                          disabled={!isEditing}
                          rows={4}
                          maxLength={500}
                          className={`block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700 px-4 py-2 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800 ${
                            profileErrors.bio
                              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                              : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                          placeholder="자신에 대해 소개해 주세요."
                        />
                        {profileErrors.bio && (
                          <p className="mt-1 text-sm text-error-600">{profileErrors.bio}</p>
                        )}
                        {isEditing && (
                          <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                            {profileForm.bio.length} / 500
                          </p>
                        )}
                      </div>

                      {/* 버튼 */}
                      {isEditing && (
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>계정 정보</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>가입일</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>이메일 인증</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
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
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>역할</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              {user?.role === 'admin' ? '관리자' : user?.role === 'professor' ? '교수' : '학생'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>

                {/* 비밀번호 변경 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h2 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>비밀번호 변경</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                          leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          }
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                          placeholder="새 비밀번호를 입력하세요"
                          leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          }
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
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2`}>정책 요구사항:</p>
                          <ul className={`text-xs ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'} space-y-1`}>
                            <li className={`flex items-center ${passwordForm.newPassword.length >= 8 && passwordForm.newPassword.length <= 20 ? (currentTheme === 'dark' ? 'text-success-400' : 'text-success-600') : (currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600')}`}>
                              <span className="mr-2">✓</span> 최소 8자, 최대 20자
                            </li>
                            <li className={`flex items-center ${passwordValidation.complexity.complexityCount >= 2 ? (currentTheme === 'dark' ? 'text-success-400' : 'text-success-600') : (currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600')}`}>
                              <span className="mr-2">✓</span> 영문 대소문자, 숫자, 특수문자 중 최소 2가지 조합 ({passwordValidation.complexity.complexityCount}/4)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                          leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="submit" loading={isLoading}>
                          비밀번호 변경
                        </Button>
                      </div>
                    </form>
                </div>

                {/* 알림 설정 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h2 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>알림 설정</h2>
                    <form onSubmit={handleNotificationSubmit} className="space-y-6">
                      <div className="space-y-4">
                        {/* 이메일 알림 */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>이메일 알림</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
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
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>과제 마감 알림</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
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
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>성적 알림</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
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
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>과목 업데이트 알림</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
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
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>주간 학습 리포트</p>
                            <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
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

                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="submit" loading={isLoading}>
                          설정 저장
                        </Button>
                      </div>
                    </form>
                </div>

                {/* 기타 설정 섹션 */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h2 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>기타 설정</h2>

                    {/* 테마 설정 섹션 */}
                    <div className="mb-8">
                      <h3 className={`text-md font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>테마</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'system' as const, name: '시스템', description: '운영 체제 설정에 따라 자동으로 변경됩니다' },
                          { value: 'light' as const, name: '라이트', description: '밝은 테마를 항상 사용합니다' },
                          { value: 'dark' as const, name: '다크', description: '어두운 테마를 항상 사용합니다' },
                        ].map((option) => (
                          <div
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              currentTheme === option.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-all ${
                                  currentTheme === option.value
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-gray-300'
                                }`}
                              >
                                {currentTheme === option.value && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    currentTheme === option.value
                                      ? 'text-primary-700 dark:text-primary-300'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {option.name}
                                </p>
                                <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{option.description}</p>
                              </div>
                              {option.value === 'system' && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  {window.matchMedia('(prefers-color-scheme: dark)').matches ? '다크 감지됨' : '라이트 감지됨'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className={`text-sm ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          <span className="font-medium">ℹ️ 정보:</span> 시스템 테마를 선택하면 운영 체제의 다크 모드 설정을 따릅니다.
                        </p>
                      </div>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-8" />

                    {/* 글꼴 설정 섹션 */}
                    <h3 className={`text-md font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>글꼴</h3>
                    <div className="space-y-4">
                      {fontOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => setFont(option.value)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            currentFont === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
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
                                    ? 'text-primary-700 dark:text-primary-300'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                                style={{ fontFamily: option.value === 'pretendard' ? "'Noto Sans KR', system-ui, sans-serif" : option.value === 'poppins' ? "'Poppins', system-ui, sans-serif" : "'Nanum Pen Script', cursive" }}
                              >
                                {option.name}
                              </p>
                              <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{option.description}</p>
                              <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-3`} style={{ fontFamily: option.value === 'pretendard' ? "'Noto Sans KR', system-ui, sans-serif" : option.value === 'poppins' ? "'Poppins', system-ui, sans-serif" : "'Nanum Pen Script', cursive" }}>
                                미리보기: 안녕하세요, 이것은 {option.name} 폰트입니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                        <p className={`text-sm ${currentTheme === 'dark' ? 'text-primary-300' : 'text-primary-700'}`}>
                          <span className="font-medium">💡 팁:</span> 선택한 테마와 글꼴은 자동으로 저장되며, 브라우저를 다시 열어도 유지됩니다.
                        </p>
                      </div>
                    </div>
                </div>
              </div>
            </Card>
        </div>
      </div>
    </StudentLayout>
  )
}

export default SettingsPage
