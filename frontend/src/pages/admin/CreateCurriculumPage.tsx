import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast, StepProgress, Modal } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import InputCounter from '@/components/common/InputCounter'
import Select from '@/components/common/Select'
import { ArrowLeft, FileUp, Edit3, Database, CheckCircle, ChevronDown, BarChart3, BookOpen } from 'lucide-react'
import { INPUT_LIMITS, limitInputLength } from '@/utils/inputValidation'
import Editor from '@monaco-editor/react'

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
  const [isFileValid, setIsFileValid] = useState<boolean | null>(null)
  const [fileValidationError, setFileValidationError] = useState('')

  // Form state
  const [createName, setCreateName] = useState('')
  const [createLanguage, setCreateLanguage] = useState('')
  const [createWeeks, setCreateWeeks] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // Language dropdown state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)

  // Cancel confirmation modal state
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Week detail modal state
  const [selectedWeek, setSelectedWeek] = useState<any>(null)
  const [showWeekDetailModal, setShowWeekDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'beginner' | 'advanced'>('beginner')
  const [expandedCycleIndex, setExpandedCycleIndex] = useState<number>(0)

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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // 파일 검증 함수
  const validateJsonFile = (data: any): { valid: boolean; error: string } => {
    // courseTitle 검증
    if (!data.courseTitle || typeof data.courseTitle !== 'string') {
      return { valid: false, error: 'courseTitle 필드가 누락되었거나 형식이 잘못되었습니다.' }
    }

    // description 검증 (선택사항이지만 있으면 문자열이어야 함)
    if (data.description && typeof data.description !== 'string') {
      return { valid: false, error: 'description 필드의 형식이 잘못되었습니다.' }
    }

    // weeks 배열 검증
    if (!data.weeks || !Array.isArray(data.weeks)) {
      return { valid: false, error: 'weeks 배열이 누락되었습니다.' }
    }

    if (data.weeks.length === 0) {
      return { valid: false, error: 'weeks 배열이 비어있습니다.' }
    }

    // 각 week 검증
    for (let i = 0; i < data.weeks.length; i++) {
      const week = data.weeks[i]

      if (!week.week || typeof week.week !== 'number') {
        return { valid: false, error: `Week ${i + 1}: week 번호가 누락되었거나 형식이 잘못되었습니다.` }
      }

      if (!week.title || typeof week.title !== 'string') {
        return { valid: false, error: `Week ${i + 1}: title이 누락되었거나 형식이 잘못되었습니다.` }
      }

      if (!week.cycles || !Array.isArray(week.cycles)) {
        return { valid: false, error: `Week ${i + 1}: cycles 배열이 누락되었습니다.` }
      }

      if (week.cycles.length === 0) {
        return { valid: false, error: `Week ${i + 1}: cycles 배열이 비어있습니다.` }
      }

      // 각 cycle 검증
      for (let j = 0; j < week.cycles.length; j++) {
        const cycle = week.cycles[j]

        const requiredFields = ['title', 'syntax_key', 'filename', 'starterCode', 'testCode', 'task', 'briefing', 'lecture', 'feedback']
        for (const field of requiredFields) {
          if (!cycle[field]) {
            return { valid: false, error: `Week ${i + 1}, Cycle ${j + 1}: ${field} 필드가 누락되었습니다.` }
          }
        }

        // syntax_key가 객체인 경우 추가 검증
        if (typeof cycle.syntax_key === 'object' && cycle.syntax_key !== null) {
          // systax_code 또는 syntax_code 둘 다 확인 (오타 대응)
          const hasCode = cycle.syntax_key.syntax_code || cycle.syntax_key.systax_code
          if (!cycle.syntax_key.syntax_title || !cycle.syntax_key.syntax_comment || !hasCode) {
            return { valid: false, error: `Week ${i + 1}, Cycle ${j + 1}: syntax_key 객체에 필수 필드(syntax_title, syntax_comment, syntax_code 또는 systax_code)가 누락되었습니다.` }
          }
        }
      }
    }

    return { valid: true, error: '' }
  }

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (fileExtension !== 'json' && fileExtension !== 'jsonc' && fileExtension !== 'xlsx') {
      addToast('JSON, JSONC 또는 xlsx 파일만 업로드할 수 있습니다.', { variant: 'error' })
      e.target.value = ''
      return
    }

    setUploadedFile(file)
    setIsFileValid(null)
    setFileValidationError('')

    // JSON/JSONC 파일 파싱
    if (fileExtension === 'json' || fileExtension === 'jsonc') {
      try {
        const text = await file.text()

        // JSONC 주석 제거
        const jsonText = text
          .split('\n')
          .filter(line => !line.trim().startsWith('//'))
          .join('\n')

        const data = JSON.parse(jsonText)

        // 파일 검증
        const validation = validateJsonFile(data)

        if (!validation.valid) {
          setIsFileValid(false)
          setFileValidationError(validation.error)
          addToast(`파일 검증 실패: ${validation.error}`, { variant: 'error' })
          return
        }

        setIsFileValid(true)
        setUploadedData(data)

        // Step 2 폼 자동 입력
        setCreateName(data.courseTitle)
        setCreateDescription(data.description || '')
        setCreateWeeks(data.weeks.length.toString())

        // 언어 자동 감지
        const filename = file.name.toLowerCase()
        if (filename.includes('python') || filename.includes('py')) {
          setCreateLanguage('Python')
        } else if (filename.includes('java')) {
          setCreateLanguage('Java')
        } else if (filename.includes('javascript') || filename.includes('js')) {
          setCreateLanguage('JavaScript')
        } else if (filename.includes('csharp') || filename.includes('c#')) {
          setCreateLanguage('C#')
        }

        addToast(`${file.name} 파일이 성공적으로 검증되었습니다.`, { variant: 'success' })
      } catch (error) {
        setIsFileValid(false)
        setFileValidationError('JSON 파싱 오류: 파일 형식이 올바르지 않습니다.')
        addToast('JSON 파일 파싱에 실패했습니다.', { variant: 'error' })
      }
    } else {
      // xlsx 파일 처리는 나중에 구현
      setIsFileValid(null)
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
    if (currentStep === 1 && creationMethod === 'upload' && uploadedFile && isFileValid === false) {
      addToast('업로드된 파일이 올바르지 않습니다. 다른 파일을 선택해주세요.', { variant: 'error' })
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
    // Step 4 (완료)에서는 바로 이동
    if (currentStep === 4) {
      navigate('/admin/curricula')
      return
    }
    // 그 외에는 확인 모달 표시
    setShowCancelModal(true)
  }

  const handleConfirmCancel = () => {
    setShowCancelModal(false)
    navigate('/admin/curricula')
  }

  const handleCloseCancelModal = () => {
    setShowCancelModal(false)
  }

  // 차시 카드 클릭 핸들러
  const handleWeekClick = (week: any) => {
    setSelectedWeek(week)
    setShowWeekDetailModal(true)
  }

  const handleCloseWeekDetailModal = () => {
    setShowWeekDetailModal(false)
    setSelectedWeek(null)
    setExpandedCycleIndex(0) // 모달 닫을 때 초기화
  }

  // 아코디언 토글
  const toggleCycle = (index: number) => {
    setExpandedCycleIndex(expandedCycleIndex === index ? -1 : index)
  }

  // 마침표를 줄바꿈으로 변환
  const replacePeriodWithNewline = (html: string | null | undefined) => {
    if (!html) return ''
    return html.replace(/\. /g, '.\n')
  }

  // 세미콜론을 줄바꿈으로 변환
  const replaceSemicolonWithNewline = (code: string | null | undefined) => {
    if (!code) return ''
    return code.replace(/;/g, ';\n')
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
                        <div className={`mt-4 p-3 rounded-lg border ${
                          isFileValid === true
                            ? currentTheme === 'dark'
                              ? 'bg-green-900/20 border-green-700'
                              : 'bg-green-50 border-green-200'
                            : isFileValid === false
                            ? currentTheme === 'dark'
                              ? 'bg-red-900/20 border-red-700'
                              : 'bg-red-50 border-red-200'
                            : currentTheme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-gray-50 border-gray-300'
                        }`}>
                          <div className="space-y-2">
                            {/* 파일명과 크기 */}
                            <div className="flex items-center gap-2 text-xs">
                              {/* 검증 상태 아이콘 */}
                              {isFileValid === true && (
                                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                              )}
                              {isFileValid === false && (
                                <svg className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              {isFileValid === null && (
                                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                              )}

                              <div className="flex-1 flex items-center justify-between">
                                <span className={`font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {uploadedFile.name}
                                </span>
                                <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  ({(uploadedFile.size / 1024).toFixed(2)} KB)
                                </span>
                              </div>
                            </div>

                            {/* 에러 메시지 (비정상인 경우) */}
                            {isFileValid === false && fileValidationError && (
                              <div className="pl-7">
                                <p className="text-xs text-red-600 dark:text-red-400">
                                  {fileValidationError}
                                </p>
                              </div>
                            )}

                            {/* 커리큘럼 정보 */}
                            {isFileValid === true && uploadedData && (
                              <div className={`pt-2 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className={`px-2 py-1 rounded ${
                                    currentTheme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {uploadedData.courseTitle || '제목 없음'}
                                  </span>
                                  <span className={`px-2 py-1 rounded ${
                                    currentTheme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {uploadedData.weeks?.length || 0}차시
                                  </span>
                                  {(() => {
                                    let beginnerCount = 0
                                    let advancedCount = 0
                                    uploadedData.weeks?.forEach((week: any) => {
                                      week.cycles?.forEach((cycle: any) => {
                                        if (cycle.task) beginnerCount++
                                        if (cycle.task_adv) advancedCount++
                                      })
                                    })
                                    return (
                                      <>
                                        <span className={`px-2 py-1 rounded ${
                                          currentTheme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                                        }`}>
                                          초급자 과제 {beginnerCount}개
                                        </span>
                                        <span className={`px-2 py-1 rounded ${
                                          currentTheme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          중급자 과제 {advancedCount}개
                                        </span>
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
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
                  <div className={`p-4 rounded-lg border ${
                    isFileValid === true
                      ? currentTheme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                      : isFileValid === false
                      ? currentTheme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                      : currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      업로드된 커리큘럼 파일
                    </h3>
                    <div className="space-y-2">
                      {/* 파일명과 크기 */}
                      <div className="flex items-center gap-2 text-xs">
                        {/* 검증 상태 아이콘 */}
                        {isFileValid === true && (
                          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        )}
                        {isFileValid === false && (
                          <svg className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {isFileValid === null && (
                          <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                        )}

                        <div className="flex-1 flex items-center justify-between">
                          <span className={`font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {uploadedFile.name}
                          </span>
                          <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            ({(uploadedFile.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                      </div>

                      {/* 에러 메시지 (비정상인 경우) */}
                      {isFileValid === false && fileValidationError && (
                        <div className="pl-7">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {fileValidationError}
                          </p>
                        </div>
                      )}

                      {/* 커리큘럼 정보 */}
                      {isFileValid === true && uploadedData && (
                        <div className={`pt-2 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              currentTheme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {uploadedData.courseTitle || '제목 없음'}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              currentTheme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {uploadedData.weeks?.length || 0}차시
                            </span>
                            {(() => {
                              let beginnerCount = 0
                              let advancedCount = 0
                              uploadedData.weeks?.forEach((week: any) => {
                                week.cycles?.forEach((cycle: any) => {
                                  if (cycle.task) beginnerCount++
                                  if (cycle.task_adv) advancedCount++
                                })
                              })
                              return (
                                <>
                                  <span className={`px-2 py-1 rounded ${
                                    currentTheme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                                  }`}>
                                    초급자 과제 {beginnerCount}개
                                  </span>
                                  <span className={`px-2 py-1 rounded ${
                                    currentTheme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    중급자 과제 {advancedCount}개
                                  </span>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
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
                    showPercentage={false}
                    showProgressBar={false}
                  />
                </div>

                {/* 차시 & 프로그래밍 언어 (좌우 배치) */}
                <div className="grid grid-cols-2 gap-4">
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

                  {/* 프로그래밍 언어 */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      프로그래밍 언어 <span className="text-error-500">*</span>
                    </label>
                    <div className="relative" ref={languageDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition flex items-center justify-between ${
                          createErrors.createLanguage
                            ? 'border-error-500'
                            : currentTheme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span className={!createLanguage ? (currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400') : ''}>
                          {createLanguage || '언어 선택'}
                        </span>
                        <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''} ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </button>

                      {isLanguageDropdownOpen && (
                        <div className={`absolute top-full left-0 mt-2 w-full rounded-lg shadow-lg border py-2 z-10 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}>
                          {['C', 'Java', 'JavaScript', 'C#', 'Python'].map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                setCreateLanguage(lang)
                                setIsLanguageDropdownOpen(false)
                                setCreateErrors({ ...createErrors, createLanguage: '' })
                              }}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                createLanguage === lang
                                  ? currentTheme === 'dark'
                                    ? 'bg-primary-900/30 text-primary-300'
                                    : 'bg-primary-50 text-primary-700'
                                  : currentTheme === 'dark'
                                  ? 'text-gray-300 hover:bg-gray-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {createErrors.createLanguage && (
                      <p className="mt-1 text-sm text-error-600">{createErrors.createLanguage}</p>
                    )}
                  </div>
                </div>

                {/* 설명 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    설명 <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => {
                      const value = e.target.value
                      // 마침표 뒤에 줄바꿈이 없으면 추가 (마지막 마침표는 제외)
                      const processedValue = value.replace(/\.(?!\n)(?!$)/g, '.\n')
                      setCreateDescription(limitInputLength(processedValue, INPUT_LIMITS.description))
                    }}
                    placeholder="커리큘럼에 대한 설명을 입력하세요"
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-pre-line ${
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
                      showPercentage={false}
                      showProgressBar={false}
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
                  {creationMethod === 'upload' && uploadedData ? '차시별 데이터를 확인하세요.' : '차시별 데이터를 입력하세요.'}
                </h2>

                {/* 파일 업로드 시 통계 정보 */}
                {creationMethod === 'upload' && uploadedData && (
                  <>
                    {/* 커리큘럼 통계 */}
                    <div className={`p-4 rounded-lg border ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart3 className="w-4 h-4" />
                        차시별 과제 요약
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                            {uploadedData.weeks?.length || 0}
                          </p>
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 차시</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                            {uploadedData.weeks?.reduce((acc: number, w: any) => acc + (w.cycles?.length || 0), 0) || 0}
                          </p>
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 과제</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
                            {(uploadedData.weeks?.reduce((acc: number, w: any) => acc + (w.cycles?.length || 0), 0) / (uploadedData.weeks?.length || 1)).toFixed(1)}
                          </p>
                          <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>평균 과제/차시</p>
                        </div>
                      </div>
                    </div>

                    {/* 차시별 데이터 */}
                    <div className={`p-4 rounded-lg border flex flex-col ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <BookOpen className="w-4 h-4" />
                        차시별 데이터
                      </h3>
                      <div className="space-y-2 flex-1 overflow-y-auto pt-1" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                        {uploadedData.weeks?.map((week: any, index: number) => {
                          // 초보자/경험자 과제 수 계산
                          let beginnerCount = 0
                          let advancedCount = 0
                          week.cycles?.forEach((cycle: any) => {
                            if (cycle.task) beginnerCount++
                            if (cycle.task_adv) advancedCount++
                          })

                          return (
                            <div
                              key={index}
                              onClick={() => handleWeekClick(week)}
                              className={`p-3 rounded border transition-all duration-200 cursor-pointer ${
                                currentTheme === 'dark'
                                  ? 'bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-primary-500 hover:-translate-y-1 hover:shadow-lg'
                                  : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-primary-300 hover:-translate-y-1 hover:shadow-lg'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {week.week}차시: {week.title}
                                </span>
                                <div className="flex flex-row gap-1 text-xs flex-shrink-0">
                                  <span className={`px-2 py-1 rounded text-center ${currentTheme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                                    초보자 {beginnerCount}개
                                  </span>
                                  <span className={`px-2 py-1 rounded text-center ${currentTheme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                                    경험자 {advancedCount}개
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
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
                    variant="secondary"
                    onClick={handlePrevious}
                  >
                    이전
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
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
                      (currentStep === 1 && (!creationMethod || (creationMethod === 'upload' && (!uploadedFile || isFileValid === false)))) ||
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

      {/* 취소 확인 모달 */}
      <Modal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        title="커리큘럼 생성 취소"
        size="sm"
      >
        <div className="space-y-4">
          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            커리큘럼 생성을 취소하시겠습니까?
            <br />
            입력한 모든 정보가 사라집니다.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleCloseCancelModal}
            >
              계속 작성
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCancel}
              className="bg-error-600 hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-700"
            >
              취소하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 차시 상세 보기 모달 */}
      <Modal
        isOpen={showWeekDetailModal}
        onClose={handleCloseWeekDetailModal}
        title={selectedWeek ? `${selectedWeek.week}차시: ${selectedWeek.title}` : '차시 상세'}
        size="full"
        forceDarkMode={true}
      >
        {selectedWeek && (
          <div className="flex flex-col h-full bg-gray-900">
            {/* 3열 레이아웃 - 20% / 55% / 25% */}
            <div className="flex-1 flex overflow-hidden">
              {/* 1열: 사이드바 (20%) */}
              <div className="w-1/5 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col">
                {/* 과제 유형 선택 섹션 */}
                <div className="border-b border-gray-700">
                  <div className="p-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        과제 유형
                      </h2>
                    </div>
                  </div>

                  <div className="pb-6 ml-6">
                    <div className="relative bg-gray-700 rounded-full p-0.5 w-32 ml-10">
                      <div className="flex relative z-10">
                        <button
                          onClick={() => setActiveTab('beginner')}
                          className={`flex-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            activeTab === 'beginner'
                              ? 'text-white'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          초보자
                        </button>
                        <button
                          onClick={() => setActiveTab('advanced')}
                          className={`flex-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            activeTab === 'advanced'
                              ? 'text-white'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          경험자
                        </button>
                      </div>
                      <div
                        className={`absolute top-0.5 bottom-0.5 w-1/2 rounded-full transition-all duration-200 ${
                          activeTab === 'beginner'
                            ? 'left-0.5 bg-green-600'
                            : 'left-1/2 bg-orange-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 과제 목록 섹션 */}
                <div className="p-6 flex-1">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeTab === 'beginner'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600'
                    }`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    과제 목록
                  </h2>

                  <div className="space-y-2">
                    {selectedWeek.cycles?.map((cycle: any, index: number) => {
                      const hasBeginnerTask = cycle.task !== null && cycle.task !== undefined
                      const hasAdvancedTask = cycle.task_adv !== null && cycle.task_adv !== undefined

                      // 현재 탭에 따른 과제 존재 여부 확인
                      const hasCurrentTask = activeTab === 'beginner' ? hasBeginnerTask : hasAdvancedTask
                      if (!hasCurrentTask) return null

                      // 초보자와 경험자의 사이클 제목이 다를 수 있으므로 처리
                      const cycleTitle = activeTab === 'beginner'
                        ? (cycle.task?.title || cycle.title)
                        : (cycle.task_adv?.title || cycle.title)

                      return (
                        <button
                          key={index}
                          onClick={() => setExpandedCycleIndex(index)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                            expandedCycleIndex === index
                              ? activeTab === 'beginner'
                                ? 'bg-green-900/30 text-green-400 shadow-lg'
                                : 'bg-orange-900/30 text-orange-400 shadow-lg'
                              : 'hover:bg-gray-700/50 text-gray-300'
                          }`}
                        >
                          {/* 선택 인디케이터 */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-200 ${
                            expandedCycleIndex === index
                              ? activeTab === 'beginner'
                                ? 'bg-green-400'
                                : 'bg-orange-400'
                              : 'bg-transparent'
                          }`} />

                          <div className="flex items-start gap-3 pl-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              expandedCycleIndex === index
                                ? activeTab === 'beginner'
                                  ? 'bg-green-500'
                                  : 'bg-orange-500'
                                : 'bg-gray-600'
                            }`}>
                              <span className="text-xs font-bold text-white">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium mb-1 ${
                                expandedCycleIndex === index
                                  ? activeTab === 'beginner'
                                    ? 'text-green-300'
                                    : 'text-orange-300'
                                  : 'text-gray-200'
                              }`}>
                                사이클 {index + 1}
                              </div>
                              <div className={`text-xs truncate ${
                                expandedCycleIndex === index
                                  ? activeTab === 'beginner'
                                    ? 'text-green-400'
                                    : 'text-orange-400'
                                  : 'text-gray-400'
                              }`} title={cycleTitle}>
                                {cycleTitle}
                              </div>
                            </div>
                            {expandedCycleIndex === index && (
                              <svg className={`w-4 h-4 flex-shrink-0 mt-1 ${
                                activeTab === 'beginner' ? 'text-green-400' : 'text-orange-400'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 2열: 메인 콘텐츠 (55%) */}
              <div className="flex-1 bg-gray-900 overflow-y-auto">
                <div className="p-6">
                  {selectedWeek.cycles?.map((cycle: any, index: number) => {
                    const cycleData = activeTab === 'beginner' ? cycle.task : cycle.task_adv
                    if (!cycleData || expandedCycleIndex !== index) return null

                    return (
                      <div key={index} className="space-y-6">
                        {/* 과제 헤더 */}
                        <div className="border-b border-gray-700 pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              activeTab === 'beginner'
                                ? 'bg-green-900/30 text-green-400 border border-green-600'
                                : 'bg-orange-900/30 text-orange-400 border border-orange-600'
                            }`}>
                              {activeTab === 'beginner' ? '초보자' : '경험자'} 과제
                            </span>
                            <span className="text-xs text-gray-500">
                              사이클 {index + 1}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {cycle.title}
                          </h2>
                        </div>

                        {/* 과제 정보 */}
                        {typeof cycleData === 'object' && (
                          <div className="space-y-6">
                            {/* 과제 설명 */}
                            <div className="p-4 rounded-lg bg-gray-800">
                              <h3 className="text-sm font-semibold mb-3 text-gray-300">
                                📝 과제 설명
                              </h3>
                              <h4 className="text-base font-medium mb-2 text-white">
                                {cycleData.title}
                              </h4>
                              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: replacePeriodWithNewline(cycleData.content) }} />
                            </div>

                            {/* 시작 코드 */}
                            {(activeTab === 'beginner' ? cycle.starterCode : cycle.starterCode_adv) && (
                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                  <span className="text-base">💻</span> 시작 코드
                                </h3>
                                <div className="rounded-lg overflow-hidden border border-gray-700">
                                  <Editor
                                    height="250px"
                                    language="python"
                                    theme="vs-dark"
                                    value={replaceSemicolonWithNewline(activeTab === 'beginner' ? cycle.starterCode : cycle.starterCode_adv)}
                                    options={{
                                      readOnly: true,
                                      minimap: { enabled: false },
                                      scrollBeyondLastLine: false,
                                      fontSize: 13,
                                      lineNumbers: 'on',
                                      automaticLayout: true,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* 테스트 코드 */}
                            {(activeTab === 'beginner' ? cycle.testCode : cycle.testCode_adv) && (
                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                  <span className="text-base">🧪</span> 테스트 코드
                                </h3>
                                <div className="rounded-lg overflow-hidden border border-gray-700">
                                  <Editor
                                    height="250px"
                                    language="python"
                                    theme="vs-dark"
                                    value={replaceSemicolonWithNewline(activeTab === 'beginner' ? cycle.testCode : cycle.testCode_adv)}
                                    options={{
                                      readOnly: true,
                                      minimap: { enabled: false },
                                      scrollBeyondLastLine: false,
                                      fontSize: 13,
                                      lineNumbers: 'on',
                                      automaticLayout: true,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* 브리핑 */}
                            {(activeTab === 'beginner' ? cycle.briefing : cycle.briefing_adv) && (
                              <div className="p-4 rounded-lg border-l-4 bg-blue-900/20 border-blue-500">
                                <h3 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-2">
                                  <span className="text-base">📢</span> 브리핑
                                </h3>
                                <h4 className="text-base font-medium mb-2 text-white">
                                  {(activeTab === 'beginner' ? cycle.briefing : cycle.briefing_adv)?.title}
                                </h4>
                                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: replacePeriodWithNewline((activeTab === 'beginner' ? cycle.briefing : cycle.briefing_adv)?.content) }} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 문자열인 경우 (하위 호환성) */}
                        {typeof cycleData === 'string' && (
                          <div className="p-4 rounded-lg bg-gray-800">
                            <p className="text-sm text-gray-300">
                              {cycleData}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 3열: 부가 정보 (25%) */}
              <div className="w-1/4 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* 현재 선택된 사이클 정보 표시 */}
                  {expandedCycleIndex >= 0 && selectedWeek.cycles?.[expandedCycleIndex] && (
                    <>
                      {/* 문법 키 정보 */}
                      {selectedWeek.cycles[expandedCycleIndex].syntax_key && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-3">📚 학습 문법</h3>
                          <div className="space-y-2">
                            {typeof selectedWeek.cycles[expandedCycleIndex].syntax_key === 'object' ? (
                              <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                                <h4 className="text-sm font-medium text-pink-400 mb-2">
                                  {selectedWeek.cycles[expandedCycleIndex].syntax_key.syntax_title}
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">
                                  {selectedWeek.cycles[expandedCycleIndex].syntax_key.syntax_comment}
                                </p>
                                {(selectedWeek.cycles[expandedCycleIndex].syntax_key.syntax_code ||
                                  selectedWeek.cycles[expandedCycleIndex].syntax_key.systax_code) && (
                                  <div className="p-2 rounded bg-gray-800 border border-gray-700">
                                    <code className="text-xs text-pink-300">
                                      {selectedWeek.cycles[expandedCycleIndex].syntax_key.syntax_code ||
                                       selectedWeek.cycles[expandedCycleIndex].syntax_key.systax_code}
                                    </code>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                                <span className="text-sm text-pink-400">
                                  {selectedWeek.cycles[expandedCycleIndex].syntax_key}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 파일 정보 */}
                      {selectedWeek.cycles[expandedCycleIndex].filename && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-3">📄 파일명</h3>
                          <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                            <code className="text-sm text-cyan-400">
                              {selectedWeek.cycles[expandedCycleIndex].filename}
                            </code>
                          </div>
                        </div>
                      )}

                      {/* 강의 내용 */}
                      {selectedWeek.cycles[expandedCycleIndex].lecture && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-3">👨‍🏫 강의 내용</h3>
                          <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                            <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto"
                              dangerouslySetInnerHTML={{
                                __html: replacePeriodWithNewline(
                                  typeof selectedWeek.cycles[expandedCycleIndex].lecture === 'object'
                                    ? selectedWeek.cycles[expandedCycleIndex].lecture.content
                                    : selectedWeek.cycles[expandedCycleIndex].lecture
                                )
                              }} />
                          </div>
                        </div>
                      )}

                      {/* 피드백 */}
                      {(activeTab === 'beginner'
                        ? selectedWeek.cycles[expandedCycleIndex].feedback
                        : selectedWeek.cycles[expandedCycleIndex].feedback_adv) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 mb-3">💬 피드백</h3>
                          <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                            <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto"
                              dangerouslySetInnerHTML={{
                                __html: replacePeriodWithNewline(
                                  typeof (activeTab === 'beginner'
                                    ? selectedWeek.cycles[expandedCycleIndex].feedback
                                    : selectedWeek.cycles[expandedCycleIndex].feedback_adv) === 'object'
                                    ? (activeTab === 'beginner'
                                        ? selectedWeek.cycles[expandedCycleIndex].feedback
                                        : selectedWeek.cycles[expandedCycleIndex].feedback_adv).content
                                    : (activeTab === 'beginner'
                                        ? selectedWeek.cycles[expandedCycleIndex].feedback
                                        : selectedWeek.cycles[expandedCycleIndex].feedback_adv)
                                )
                              }} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 하단: 닫기 버튼 (우측 정렬) */}
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-900">
              <div className="flex justify-end">
                <Button variant="secondary" onClick={handleCloseWeekDetailModal}>
                  닫기
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

export default CreateCurriculumPage
