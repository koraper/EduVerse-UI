import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import { ArrowLeft } from 'lucide-react'

const CreateCurriculumPage = () => {
  const navigate = useNavigate()
  const { user, token, isLoading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const { handleError, handleResponseError } = useApiError({
    onAuthError: () => navigate('/login'),
    onPermissionError: () => navigate('/admin/dashboard'),
  })
  const { addToast } = useToast()

  // Form state
  const [createName, setCreateName] = useState('')
  const [createLanguage, setCreateLanguage] = useState('')
  const [createWeeks, setCreateWeeks] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // Auth check
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'admin') {
      navigate(`/${user.role}/dashboard`)
    }
  }, [user, authLoading, navigate])

  // 생성 폼 검증
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!createName.trim()) {
      errors.createName = '커리큘럼명을 입력해주세요'
    }
    if (!createLanguage) {
      errors.createLanguage = '프로그래밍 언어를 선택해주세요'
    }
    if (!createWeeks || parseInt(createWeeks) < 1 || parseInt(createWeeks) > 52) {
      errors.createWeeks = '주차는 1-52 사이의 숫자여야 합니다.'
    }
    if (!createDescription.trim()) {
      errors.createDescription = '설명을 입력해주세요'
    }

    setCreateErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 커리큘럼 생성
  const handleCreateCurriculum = async () => {
    if (!validateCreateForm()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/curriculums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName,
          language: createLanguage,
          weeks: parseInt(createWeeks),
          description: createDescription,
        }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('커리큘럼이 생성되었습니다.', { variant: 'success' })
        navigate('/admin/curricula')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  // 취소
  const handleCancel = () => {
    navigate('/admin/curricula')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                커리큘럼 생성
              </h1>
              <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                새로운 프로그래밍 커리큘럼을 생성하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 생성 폼 */}
        <Card>
          <div className="p-6 space-y-6">
            {/* 커리큘럼명 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                커리큘럼명 <span className="text-error-500">*</span>
              </label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="예: Python 기초 프로그래밍"
                error={createErrors.createName}
              />
            </div>

            {/* 프로그래밍 언어 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                프로그래밍 언어 <span className="text-error-500">*</span>
              </label>
              <Select
                value={createLanguage}
                onChange={(e) => setCreateLanguage(e.target.value)}
                options={[
                  { value: '', label: '언어 선택' },
                  { value: 'C', label: 'C' },
                  { value: 'Java', label: 'Java' },
                  { value: 'JavaScript', label: 'JavaScript' },
                  { value: 'C#', label: 'C#' },
                ]}
                error={createErrors.createLanguage}
              />
            </div>

            {/* 주차 수 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                주차 수 <span className="text-error-500">*</span>
              </label>
              <Input
                type="number"
                value={createWeeks}
                onChange={(e) => setCreateWeeks(e.target.value)}
                placeholder="1-52"
                min="1"
                max="52"
                error={createErrors.createWeeks}
              />
              <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                1주차부터 52주차까지 설정할 수 있습니다.
              </p>
            </div>

            {/* 설명 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                설명 <span className="text-error-500">*</span>
              </label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="커리큘럼에 대한 설명을 입력하세요"
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  createErrors.createDescription
                    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                    : currentTheme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500 focus:ring-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500'
                }`}
              />
              {createErrors.createDescription && (
                <p className="mt-1 text-sm text-error-600">{createErrors.createDescription}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
              currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isCreating}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateCurriculum}
                loading={isCreating}
              >
                생성
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default CreateCurriculumPage
