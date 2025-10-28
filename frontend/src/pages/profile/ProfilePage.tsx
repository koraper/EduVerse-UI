import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/common/ToastContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import {
  validateName,
  validateEmail,
  validatePhone,
  validateDepartment,
  validateTextField,
  FORM_INPUT_LIMITS,
} from '@/utils/formValidation'

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth()
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    phone: '',
    department: '',
    studentId: '',
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        phone: user.phone || '',
        department: user.department || '',
        studentId: user.studentId || '',
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = { name: '', email: '', phone: '', department: '', bio: '' }

    // 이름 검증 - formValidation 유틸 사용
    const nameError = validateName(formData.name)
    if (nameError) {
      newErrors.name = nameError
    }

    // 이메일 검증 - formValidation 유틸 사용
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    // 전화번호 검증 (선택) - formValidation 유틸 사용
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone, false)
      if (phoneError) {
        newErrors.phone = phoneError
      }
    }

    // 소속/학과 검증 (선택) - formValidation 유틸 사용
    const departmentError = validateDepartment(formData.department, false)
    if (departmentError) {
      newErrors.department = departmentError
    }

    // 자기소개 검증 (선택) - formValidation 유틸 사용
    const bioError = validateTextField(formData.bio, '자기소개', 500, false)
    if (bioError) {
      newErrors.bio = bioError
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const isDev = import.meta.env.DEV
      if (isDev) {
        // 개발 모드: 모든 과정이 성공한 것으로 처리
        await new Promise((resolve) => setTimeout(resolve, 800))

        // AuthContext 업데이트
        if (user) {
          updateUser({
            ...user,
            ...formData,
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
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (data.status === 'success') {
          // AuthContext 업데이트 (localStorage의 auth_user 갱신)
          if (data.data?.user) {
            updateUser(data.data.user)
          }
          addToast('프로필이 성공적으로 저장되었습니다', { variant: 'success' })
          setIsEditing(false)
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

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
    })
    setErrors({ name: '', email: '', phone: '', department: '', bio: '' })
  }

  // 실시간 유효성 검사
  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value })

    if (value.trim().length > 0 && value.trim().length < 2) {
      setErrors({ ...errors, name: '이름은 최소 2자 이상이어야 합니다' })
    } else if (value.trim().length > 50) {
      setErrors({ ...errors, name: '이름은 최대 50자까지 입력 가능합니다' })
    } else if (value.trim().length > 0 && !/^ㄴ+$/.test(value.trim())) {
      setErrors({ ...errors, name: '이름은 한글 또는 영문만 입력 가능합니다' })
    } else {
      setErrors({ ...errors, name: '' })
    }
  }

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value })

    if (value && !/^[0-9-]+$/.test(value)) {
      setErrors({ ...errors, phone: '숫자와 - 만 입력 가능합니다' })
    } else {
      setErrors({ ...errors, phone: '' })
    }
  }

  const handleDepartmentChange = (value: string) => {
    setFormData({ ...formData, department: value })

    if (value.trim().length > 100) {
      setErrors({ ...errors, department: '소속은 최대 100자까지 입력 가능합니다' })
    } else {
      setErrors({ ...errors, department: '' })
    }
  }

  const handleBioChange = (value: string) => {
    setFormData({ ...formData, bio: value })

    if (value.trim().length > 500) {
      setErrors({ ...errors, bio: '자기소개는 최대 500자까지 입력 가능합니다' })
    } else {
      setErrors({ ...errors, bio: '' })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">프로필</h1>
          <p className="mt-1 text-sm text-gray-600">개인 정보를 관리하세요</p>
        </div>

        {/* 프로필 카드 */}
        <Card>
          <div className="p-6">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-error-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={!isEditing}
                    error={errors.name}
                    maxLength={50}
                  />
                  {isEditing && (
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {formData.name.length} / 50
                    </p>
                  )}
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-error-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={true}
                    error={errors.email}
                    helperText="이메일은 수정할 수 없습니다"
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="010-1234-5678"
                    disabled={!isEditing}
                    error={errors.phone}
                    maxLength={13}
                    helperText={!errors.phone ? "예: 010-1234-5678" : undefined}
                  />
                </div>

                {/* 소속/학과 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {user?.role === 'admin' ? '소속' : user?.role === 'professor' ? '소속 부서' : '학과'}
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    placeholder={user?.role === 'admin' ? '교육지원팀' : user?.role === 'professor' ? '컴퓨터공학부' : '컴퓨터공학과'}
                    disabled={!isEditing}
                    error={errors.department}
                    maxLength={100}
                  />
                  {isEditing && (
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {formData.department.length} / 100
                    </p>
                  )}
                </div>

                {/* 학번 (학생만) */}
                {user?.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학번
                    </label>
                    <Input
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="2024123456"
                      disabled={!isEditing}
                    />
                  </div>
                )}
              </div>

              {/* 자기소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleBioChange(e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isEditing
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  } ${errors.bio ? 'border-error-500' : ''}`}
                  placeholder={
                    user?.role === 'admin'
                      ? '담당 업무나 소개를 입력하세요'
                      : user?.role === 'professor'
                      ? '교수님의 연구 분야나 관심사를 입력하세요'
                      : '자신에 대해 소개해주세요'
                  }
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-error-600">{errors.bio}</p>
                )}
                {isEditing && (
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {formData.bio.length} / 500
                  </p>
                )}
              </div>

              {/* 버튼 */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                  >
                    저장
                  </Button>
                </div>
              )}
            </form>
          </div>
        </Card>

        {/* 계정 정보 */}
        <Card>
          <div className="p-6">
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
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
