import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast, StepProgress } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import InputCounter from '@/components/common/InputCounter'
import Select from '@/components/common/Select'
import { ArrowLeft, FileUp, Edit3, Database, CheckCircle } from 'lucide-react'
import { INPUT_LIMITS, limitInputLength } from '@/utils/inputValidation'

const CreateCurriculumPage = () => {
  const navigate = useNavigate()
  const { user, token, isLoading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const { handleError, handleResponseError } = useApiError({
    onAuthError: () => navigate('/login'),
    onPermissionError: () => navigate('/admin/dashboard'),
  })
  const { addToast } = useToast()

  // Step state
  const [currentStep, setCurrentStep] = useState(1)
  const [creationMethod, setCreationMethod] = useState<'manual' | 'upload' | ''>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedData, setUploadedData] = useState<any>(null)

  // Form state
  const [createName, setCreateName] = useState('')
  const [createLanguage, setCreateLanguage] = useState('')
  const [createWeeks, setCreateWeeks] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // Steps definition
  const steps = [
    { id: 1, title: '생성 방법 선택', description: '커리큘럼 생성 방식 선택' },
    { id: 2, title: '정보 입력/확인', description: '기본 정보 입력' },
    { id: 3, title: '데이터 입력/확인', description: '상세 데이터 입력' },
    { id: 4, title: '완료', description: '생성 완료' },
  ]

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
    } else if (createDescription.length > INPUT_LIMITS.description) {
      errors.createDescription = `설명은 최대 ${INPUT_LIMITS.description}자까지 입력 가능합니다`
    }

    setCreateErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (fileExtension !== 'json' && fileExtension !== 'xlsx') {
      addToast('JSON 또는 xlsx 파일만 업로드할 수 있습니다.', { variant: 'error' })
      e.target.value = '' // Reset input
      return
    }

    setUploadedFile(file)

    // JSON 파일 파싱
    if (fileExtension === 'json') {
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        // 데이터 유효성 검증
        if (!data.courseTitle || !data.weeks || !Array.isArray(data.weeks)) {
          addToast('올바른 커리큘럼 JSON 형식이 아닙니다.', { variant: 'error' })
          setUploadedFile(null)
          e.target.value = ''
          return
        }

        setUploadedData(data)

        // Step 2 폼 자동 입력
        setCreateName(data.courseTitle)
        setCreateWeeks(data.weeks.length.toString())

        addToast(`${file.name} 파일이 성공적으로 로드되었습니다.`, { variant: 'success' })
      } catch (error) {
        addToast('JSON 파일 파싱에 실패했습니다.', { variant: 'error' })
        setUploadedFile(null)
        e.target.value = ''
      }
    } else {
      // xlsx 파일 처리는 나중에 구현
      addToast(`${file.name} 파일이 선택되었습니다. (xlsx 파싱은 추후 구현 예정)`, { variant: 'info' })
    }
  }

  // Step navigation
  const handleNext = () => {
    if (currentStep === 1 && !creationMethod) {
      addToast('생성 방법을 선택해주세요.', { variant: 'warning' })
      return
    }
    if (currentStep === 1 && creationMethod === 'upload' && !uploadedFile) {
      addToast('파일을 업로드해주세요.', { variant: 'warning' })
      return
    }
    if (currentStep === 2 && !validateCreateForm()) {
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
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
        setCurrentStep(4) // Move to completion step
        addToast('커리큘럼이 생성되었습니다.', { variant: 'success' })
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

        {/* Progress Indicator */}
        <StepProgress steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <Card>
          <div className="p-6 space-y-6">
            {/* Step 1: 생성 방법 선택 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className={`text-xl font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  커리큘럼 생성 방법을 선택하세요.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 직접 입력 */}
                  <button
                    onClick={() => setCreationMethod('manual')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      creationMethod === 'manual'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : currentTheme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <Edit3 className={`w-12 h-12 mx-auto mb-4 ${
                      creationMethod === 'manual' ? 'text-primary-500' : currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <h3 className={`text-lg font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      직접 입력
                    </h3>
                    <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      커리큘럼 정보를 직접 입력하여 생성합니다.
                    </p>
                  </button>

                  {/* 파일 업로드 */}
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".json,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        setCreationMethod('upload')
                        document.getElementById('file-upload')?.click()
                      }}
                      className={`w-full p-6 rounded-lg border-2 transition-all ${
                        creationMethod === 'upload'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : currentTheme === 'dark'
                          ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <FileUp className={`w-12 h-12 mx-auto mb-4 ${
                        creationMethod === 'upload' ? 'text-primary-500' : currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <h3 className={`text-lg font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        파일 업로드
                      </h3>
                      <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        JSON 또는 엑셀 파일을 업로드하여 생성합니다.
                      </p>
                      {uploadedFile && (
                        <p className={`mt-3 text-xs font-medium ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                          선택됨: {uploadedFile.name}
                        </p>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 정보 입력/확인 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className={`text-xl font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  기본 정보를 입력하세요.
                </h2>

                {/* 파일 업로드 시 파일 정보 표시 */}
                {creationMethod === 'upload' && uploadedFile && (
                  <div className={`p-4 rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      업로드된 파일
                    </h3>
                    <div className="flex items-center space-x-2">
                      <FileUp className={`w-4 h-4 ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`} />
                      <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {uploadedFile.name}
                      </span>
                      <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({(uploadedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    {uploadedData && (
                      <p className={`mt-2 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        자동 추출: {uploadedData.weeks?.length}주차, {uploadedData.weeks?.reduce((acc: number, w: any) => acc + w.cycles?.length || 0, 0)}개 사이클
                      </p>
                    )}
                  </div>
                )}

                {/* 커리큘럼명 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    커리큘럼명 <span className="text-error-500">*</span>
                  </label>
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(limitInputLength(e.target.value, INPUT_LIMITS.title))}
                    placeholder="예: Python 기초 프로그래밍"
                    error={createErrors.createName}
                    maxLength={INPUT_LIMITS.title}
                  />
                  <InputCounter
                    currentLength={createName.length}
                    maxLength={INPUT_LIMITS.title}
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
                    차시 <span className="text-error-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={createWeeks}
                    onChange={(e) => setCreateWeeks(e.target.value)}
                    placeholder="1-52"
                    min="1"
                    max="52"
                    error={createErrors.createWeeks}
                    disabled={creationMethod === 'upload' && uploadedData}
                  />
                  <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {creationMethod === 'upload' && uploadedData
                      ? '파일에서 자동으로 계산된 차시입니다.'
                      : '1차시부터 16차시까지 설정할 수 있습니다.'
                    }
                  </p>
                </div>

                {/* 설명 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    설명 <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(limitInputLength(e.target.value, INPUT_LIMITS.description))}
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
                  <div className="mt-2">
                    <InputCounter
                      currentLength={createDescription.length}
                      maxLength={INPUT_LIMITS.description}
                      showPercentage={true}
                      showWarning={true}
                    />
                  </div>
                  {createErrors.createDescription && (
                    <p className="mt-1 text-sm text-error-600">{createErrors.createDescription}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: 데이터 입력/확인 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className={`text-xl font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {creationMethod === 'upload' && uploadedData ? '업로드된 데이터를 확인하세요.' : '상세 데이터를 입력하세요.'}
                </h2>

                {/* 파일 업로드 시 통계 정보 */}
                {creationMethod === 'upload' && uploadedData && (
                  <>
                    {/* 커리큘럼 통계 */}
                    <div className={`p-4 rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                      <h3 className={`text-sm font-semibold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        📊 커리큘럼 통계
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                            {uploadedData.weeks?.length || 0}
                          </p>
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 주차</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                            {uploadedData.weeks?.reduce((acc: number, w: any) => acc + (w.cycles?.length || 0), 0) || 0}
                          </p>
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 사이클</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                            {(uploadedData.weeks?.reduce((acc: number, w: any) => acc + (w.cycles?.length || 0), 0) / (uploadedData.weeks?.length || 1)).toFixed(1)}
                          </p>
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>평균 사이클/주</p>
                        </div>
                      </div>
                    </div>

                    {/* 주차별 구조 */}
                    <div className={`p-4 rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <h3 className={`text-sm font-semibold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        📚 주차별 구조
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uploadedData.weeks?.map((week: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded border ${currentTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Week {week.week}: {week.title}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${currentTheme === 'dark' ? 'bg-primary-900 text-primary-300' : 'bg-primary-100 text-primary-700'}`}>
                                {week.cycles?.length || 0} 사이클
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 직접 입력 시 메시지 */}
                {creationMethod === 'manual' && (
                  <div className={`p-6 rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <Database className={`w-16 h-16 mx-auto mb-4 ${currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-center ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      주차별 학습 목표 및 과제 데이터를 입력하는 기능이 추가될 예정입니다.
                    </p>
                  </div>
                )}

                {/* 입력된 정보 요약 */}
                <div className={`p-4 rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ✅ 입력된 정보 확인
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>커리큘럼명:</span>
                      <span className={currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}>{createName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>언어:</span>
                      <span className={currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}>{createLanguage || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>주차 수:</span>
                      <span className={currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}>{createWeeks || '-'}</span>
                    </div>
                    {creationMethod === 'upload' && uploadedFile && (
                      <div className="flex justify-between">
                        <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>업로드 파일:</span>
                        <span className={currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}>{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: 완료 */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center py-8">
                <CheckCircle className="w-20 h-20 mx-auto text-success-500" />
                <h2 className={`text-2xl font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  커리큘럼이 생성되었습니다!
                </h2>
                <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  커리큘럼 목록으로 이동하여 생성된 커리큘럼을 확인하세요.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={`flex items-center justify-between pt-4 border-t ${
              currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                {currentStep > 1 && currentStep < 4 && (
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                  >
                    이전
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isCreating}
                >
                  {currentStep === 4 ? '닫기' : '취소'}
                </Button>
                {currentStep < 3 && (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!creationMethod || (creationMethod === 'upload' && !uploadedFile))) ||
                      (currentStep === 2 && (!createName.trim() || !createLanguage || !createWeeks || !createDescription.trim()))
                    }
                  >
                    다음
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    variant="primary"
                    onClick={handleCreateCurriculum}
                    loading={isCreating}
                  >
                    생성
                  </Button>
                )}
                {currentStep === 4 && (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/admin/curricula')}
                  >
                    목록으로
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default CreateCurriculumPage
