import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Autocomplete from '@/components/common/Autocomplete'
import Select from '@/components/common/Select'
import Skeleton, { CardSkeleton, StatCardSkeleton } from '@/components/common/Skeleton'
import { useClientSearchSuggestions } from '@/hooks/useSearchSuggestions'
import { exportToCSV, exportToXLSX, getFilenameWithDate, formatDate } from '@/utils/export'
import { ChevronDown } from 'lucide-react'

interface Curriculum {
  id: number
  name: string
  description: string
  language: 'C' | 'Java' | 'JavaScript' | 'C#'
  weeks: number
  status: 'active' | 'archived'
  createdAt: string
  classCount?: number
}

const CurriculumManagementPage = () => {
  const navigate = useNavigate()
  const { user, token, isLoading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const { handleError, handleResponseError } = useApiError({
    onAuthError: () => navigate('/login'),
    onPermissionError: () => navigate('/admin/dashboard'),
  })
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  // 검색 자동완성 - filterFn을 useCallback으로 메모이제이션하여 무한 루프 방지
  const curriculumFilterFn = useCallback(
    (curriculum: Curriculum, query: string) => {
      const q = query.toLowerCase()
      return (
        curriculum.name.toLowerCase().includes(q) ||
        curriculum.description.toLowerCase().includes(q)
      )
    },
    []
  )

  const { suggestions: curriculumSuggestions } = useClientSearchSuggestions(
    searchTerm,
    curriculums,
    curriculumFilterFn,
    { debounceDelay: 100, minChars: 1, maxSuggestions: 10 }
  )

  // 대량 작업
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<'active' | 'archived'>('active')
  const [isBulkStatusChanging, setIsBulkStatusChanging] = useState(false)

  // 커리큘럼 생성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createLanguage, setCreateLanguage] = useState('')
  const [createWeeks, setCreateWeeks] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // 커리큘럼 수정 - 비밀번호 확인 모달
  const [isEditPasswordModalOpen, setIsEditPasswordModalOpen] = useState(false)
  const [editPasswordCurriculum, setEditPasswordCurriculum] = useState<Curriculum | null>(null)
  const [editPassword, setEditPassword] = useState('')
  const [editPasswordError, setEditPasswordError] = useState('')
  const [isVerifyingEditPassword, setIsVerifyingEditPassword] = useState(false)

  // 커리큘럼 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editCurriculum, setEditCurriculum] = useState<Curriculum | null>(null)
  const [editName, setEditName] = useState('')
  const [editWeeks, setEditWeeks] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // 커리큘럼 삭제 모달
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteCurriculum, setDeleteCurriculum] = useState<Curriculum | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmName, setDeleteConfirmName] = useState('')

  // 커리큘럼 상세 모달
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [curriculumDetails, setCurriculumDetails] = useState<any>(null)

  // 커리큘럼 구조 가이드 모달 (개발 환경 전용)
  const [isStructureGuideOpen, setIsStructureGuideOpen] = useState(false)
  const isDevelopment = import.meta.env.DEV

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterLanguage, filterStatus])

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

    fetchCurriculums()
  }, [user, authLoading, navigate])

  // 언어 드롭다운 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
    }

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageDropdownOpen])

  // 상태 드롭다운 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  const fetchCurriculums = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/curriculums', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setCurriculums(data.data.curriculums)
      } else {
        throw new Error(data.message || '커리큘럼 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurriculumDetails = async (curriculumId: number) => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/curriculums/${curriculumId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setCurriculumDetails(data.data)
      } else {
        throw new Error(data.message || '커리큘럼 상세 정보 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewDetails = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum)
    setCurriculumDetails(null)
    setIsDetailModalOpen(true)
    fetchCurriculumDetails(curriculum.id)
  }

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
      errors.createWeeks = '주차는 1-52 사이의 숫자여야 합니다'
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
        addToast('커리큘럼이 생성되었습니다', { variant: 'success' })
        setIsCreateModalOpen(false)
        setCreateName('')
        setCreateLanguage('')
        setCreateWeeks('')
        setCreateDescription('')
        setCreateErrors({})
        fetchCurriculums()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  // 수정 - 비밀번호 확인 모달 열기
  const handleOpenEditModal = (curriculum: Curriculum) => {
    setEditPasswordCurriculum(curriculum)
    setEditPassword('')
    setEditPasswordError('')
    setIsEditPasswordModalOpen(true)
  }

  // 수정 - 비밀번호 확인
  const handleVerifyEditPassword = async () => {
    if (!editPassword.trim()) {
      setEditPasswordError('비밀번호를 입력해주세요')
      return
    }

    setIsVerifyingEditPassword(true)
    setEditPasswordError('')

    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: editPassword }),
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        // 비밀번호 확인 성공 - 수정 모달 열기
        setIsEditPasswordModalOpen(false)
        setEditPassword('')

        if (editPasswordCurriculum) {
          setEditCurriculum(editPasswordCurriculum)
          setEditName(editPasswordCurriculum.name)
          setEditWeeks(editPasswordCurriculum.weeks.toString())
          setEditDescription(editPasswordCurriculum.description)
          setEditErrors({})
          setIsEditModalOpen(true)
        }
      } else {
        setEditPasswordError(data.message || '비밀번호가 일치하지 않습니다')
      }
    } catch (error: any) {
      setEditPasswordError(error.message || '비밀번호 확인에 실패했습니다')
    } finally {
      setIsVerifyingEditPassword(false)
    }
  }

  // 수정 폼 검증
  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!editName.trim()) {
      errors.editName = '커리큘럼명을 입력해주세요'
    }
    if (!editWeeks || parseInt(editWeeks) < 1 || parseInt(editWeeks) > 52) {
      errors.editWeeks = '주차는 1-52 사이의 숫자여야 합니다'
    }
    if (!editDescription.trim()) {
      errors.editDescription = '설명을 입력해주세요'
    }

    setEditErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 커리큘럼 수정
  const handleEditCurriculum = async () => {
    if (!validateEditForm() || !editCurriculum) return

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/curriculums/${editCurriculum.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          weeks: parseInt(editWeeks),
          description: editDescription,
        }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('커리큘럼이 수정되었습니다', { variant: 'success' })
        setIsEditModalOpen(false)
        setEditCurriculum(null)
        setEditErrors({})
        fetchCurriculums()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsEditing(false)
    }
  }

  // 삭제 모달 열기
  const handleOpenDeleteModal = (curriculum: Curriculum) => {
    setDeleteCurriculum(curriculum)
    setDeleteError('')
    setDeletePassword('')
    setDeleteConfirmName('')
    setIsDeleteModalOpen(true)
  }

  // 커리큘럼 삭제 (관리자 비밀번호 + 수업 연결 확인)
  const handleDeleteCurriculum = async () => {
    if (!deleteCurriculum) return

    // 유효성 검사
    if (!deletePassword || deletePassword.length < 3) {
      setDeleteError('관리자 비밀번호를 입력해 주세요')
      return
    }

    if (deleteConfirmName !== deleteCurriculum.name) {
      setDeleteError('커리큘럼명이 일치하지 않습니다')
      return
    }

    // 수업 연결 확인
    if (deleteCurriculum.classCount && deleteCurriculum.classCount > 0) {
      setDeleteError(`이 커리큘럼과 연결된 ${deleteCurriculum.classCount}개의 수업이 있어 삭제할 수 없습니다. 먼저 상태를 '보관'으로 변경하세요.`)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/curriculums/${deleteCurriculum.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setDeleteError(errorData.message || '삭제에 실패했습니다')
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('커리큘럼이 삭제되었습니다', { variant: 'success' })
        setIsDeleteModalOpen(false)
        setDeleteCurriculum(null)
        setDeleteError('')
        setDeletePassword('')
        setDeleteConfirmName('')
        fetchCurriculums()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 커리큘럼 보관/활성화
  const handleToggleArchive = async (curriculum: Curriculum) => {
    const newStatus = curriculum.status === 'active' ? 'archived' : 'active'
    const actionText = newStatus === 'archived' ? '보관' : '활성화'

    try {
      const response = await fetch(`/api/admin/curriculums/${curriculum.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast(`커리큘럼이 ${actionText}되었습니다`, { variant: 'success' })
        fetchCurriculums()
      } else {
        throw new Error(data.message || `커리큘럼 ${actionText}에 실패했습니다`)
      }
    } catch (error) {
      handleError(error)
    }
  }

  // CSV 내보내기
  const handleExportCSV = () => {
    const exportData = filteredCurriculums.map((curriculum) => ({
      'ID': curriculum.id,
      '커리큘럼명': curriculum.name,
      '프로그래밍 언어': curriculum.language,
      '주차 수': curriculum.weeks,
      '설명': curriculum.description,
      '생성 한 수업': curriculum.classCount || 0,
      '생성일': formatDate(curriculum.createdAt),
    }))

    const filename = getFilenameWithDate('커리큘럼목록', 'csv')
    exportToCSV(exportData, { filename })
    addToast('CSV 파일이 다운로드되었습니다', { variant: 'success' })
  }

  // XLSX 내보내기
  const handleExportXLSX = () => {
    const exportData = filteredCurriculums.map((curriculum) => ({
      'ID': curriculum.id,
      '커리큘럼명': curriculum.name,
      '프로그래밍 언어': curriculum.language,
      '주차 수': curriculum.weeks,
      '설명': curriculum.description,
      '생성 한 수업': curriculum.classCount || 0,
      '생성일': formatDate(curriculum.createdAt),
    }))

    const filename = getFilenameWithDate('커리큘럼목록', 'xlsx')
    exportToXLSX(exportData, { filename, sheetName: '커리큘럼' })
    addToast('엑셀 파일이 다운로드되었습니다', { variant: 'success' })
  }

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedCurriculumIds.length === filteredCurriculums.length) {
      setSelectedCurriculumIds([])
    } else {
      setSelectedCurriculumIds(filteredCurriculums.map((c) => c.id))
    }
  }

  // 개별 선택
  const handleSelectCurriculum = (id: number) => {
    if (selectedCurriculumIds.includes(id)) {
      setSelectedCurriculumIds(selectedCurriculumIds.filter((cId) => cId !== id))
    } else {
      setSelectedCurriculumIds([...selectedCurriculumIds, id])
    }
  }

  // 일괄 상태 변경
  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedCurriculumIds.length === 0) return

    setIsBulkStatusChanging(true)
    try {
      // 각 커리큘럼의 상태를 변경
      const updatedCurriculums = curriculums.map((c) => {
        if (selectedCurriculumIds.includes(c.id)) {
          return { ...c, status: bulkStatus }
        }
        return c
      })

      setCurriculums(updatedCurriculums)
      setSelectedCurriculumIds([])
      setIsBulkStatusModalOpen(false)

      const statusText = bulkStatus === 'active' ? '활성' : '보관'
      addToast(`${selectedCurriculumIds.length}개의 커리큘럼이 ${statusText} 상태로 변경되었습니다`, { variant: 'success' })
    } catch (error) {
      handleError(error)
    } finally {
      setIsBulkStatusChanging(false)
    }
  }

  // 대량 삭제
  const handleBulkDelete = async () => {
    if (selectedCurriculumIds.length === 0) return

    // 수업 연결 확인
    const selectedCurrs = curriculums.filter((c) => selectedCurriculumIds.includes(c.id))
    const linkedCurrs = selectedCurrs.filter((c) => c.classCount && c.classCount > 0)

    if (linkedCurrs.length > 0) {
      addToast(`${linkedCurrs.length}개의 커리큘럼이 수업과 연결되어 있어 삭제할 수 없습니다`, { variant: 'error' })
      return
    }

    setIsBulkDeleting(true)
    try {
      // 실제 환경에서는 Promise.all로 각각 DELETE 요청을 보내야 함
      const updatedCurriculums = curriculums.filter((c) => !selectedCurriculumIds.includes(c.id))
      setCurriculums(updatedCurriculums)
      setSelectedCurriculumIds([])
      setIsBulkDeleteModalOpen(false)
      addToast(`${selectedCurriculumIds.length}개의 커리큘럼이 삭제되었습니다`, { variant: 'success' })
    } catch (error) {
      handleError(error)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // 스켈레톤 UI 렌더링 (인증 로딩 중 또는 데이터 로딩 중)
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* 헤더 스켈레톤 */}
          <div>
            <Skeleton variant="text" width="40%" height={32} className="mb-2" />
            <Skeleton variant="text" width="60%" height={20} />
          </div>

          {/* 통계 카드 스켈레톤 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* 필터 스켈레톤 */}
          <Card>
            <div className="p-4">
              <div className="flex gap-4">
                <Skeleton variant="rectangular" className="flex-1 h-10" />
                <Skeleton variant="rectangular" width={150} height={40} />
              </div>
            </div>
          </Card>

          {/* 커리큘럼 카드 스켈레톤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const filteredCurriculums = curriculums.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLanguage = filterLanguage === 'all' || c.language === filterLanguage
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus

    return matchesSearch && matchesLanguage && matchesStatus
  })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredCurriculums.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCurriculums = filteredCurriculums.slice(startIndex, endIndex)

  // 페이지네이션 핸들러
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  // 통계
  const totalCurriculums = curriculums.length
  const activeCurriculums = curriculums.filter((c) => c.status === 'active').length
  const archivedCurriculums = curriculums.filter((c) => c.status === 'archived').length
  const languageCounts = {
    C: curriculums.filter((c) => c.language === 'C').length,
    Java: curriculums.filter((c) => c.language === 'Java').length,
    JavaScript: curriculums.filter((c) => c.language === 'JavaScript').length,
    'C#': curriculums.filter((c) => c.language === 'C#').length,
  }
  const totalClasses = 10

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>커리큘럼 관리</h1>
            <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>프로그래밍 커리큘럼을 생성, 수정, 관리하세요</p>
          </div>
          <div className="flex items-center space-x-3">
            {isDevelopment && (
              <Button
                variant="outline"
                onClick={() => setIsStructureGuideOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                커리큘럼 구조
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => {
                setCreateName('')
                setCreateLanguage('')
                setCreateWeeks('')
                setCreateDescription('')
                setCreateErrors({})
                setIsCreateModalOpen(true)
              }}
            >
              커리큘럼 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 커리큘럼</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalCurriculums}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentTheme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-50'
                }`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>활성 커리큘럼</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-success-400' : 'text-success-600'}`}>{activeCurriculums}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentTheme === 'dark' ? 'bg-success-500/20' : 'bg-success-50'
                }`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-success-400' : 'text-success-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>보관 커리큘럼</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{archivedCurriculums}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>생성 된 수업</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{totalClasses}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  currentTheme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                }`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Autocomplete
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSelect={(curriculum) => {
                    setSearchTerm(curriculum.name)
                  }}
                  suggestions={curriculumSuggestions}
                  isLoading={false}
                  placeholder="커리큘럼명, 설명으로 검색..."
                  renderSuggestion={(curriculum) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{curriculum.name}</span>
                      <span className="text-xs text-gray-500">{curriculum.language} • {curriculum.weeks}주</span>
                    </div>
                  )}
                  getSuggestionKey={(curriculum) => curriculum.id}
                  getSuggestionValue={(curriculum) => curriculum.name}
                  minCharsToShow={1}
                  maxSuggestions={10}
                />
              </div>
              {/* 커스텀 언어 드롭다운 */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className={`w-[160px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition flex items-center justify-between ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{filterLanguage === 'all' ? '모든 언어' : filterLanguage}</span>
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
                    {['all', 'C', 'Java', 'JavaScript', 'C#'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setFilterLanguage(lang)
                          setIsLanguageDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          filterLanguage === lang
                            ? currentTheme === 'dark'
                              ? 'bg-primary-900/30 text-primary-300'
                              : 'bg-primary-50 text-primary-700'
                            : currentTheme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {lang === 'all' ? '모든 언어' : lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* 커스텀 상태 드롭다운 */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`w-[140px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition flex items-center justify-between ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{filterStatus === 'all' ? '모든 상태' : filterStatus === 'active' ? '활성' : '보관'}</span>
                  <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''} ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className={`absolute top-full left-0 mt-2 w-full rounded-lg shadow-lg border py-2 z-10 ${
                    currentTheme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    {[
                      { value: 'all', label: '모든 상태' },
                      { value: 'active', label: '활성' },
                      { value: 'archived', label: '보관' }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          setFilterStatus(status.value)
                          setIsStatusDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          filterStatus === status.value
                            ? currentTheme === 'dark'
                              ? 'bg-primary-900/30 text-primary-300'
                              : 'bg-primary-50 text-primary-700'
                            : currentTheme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 결과 카운트 */}
            <div className="flex items-center justify-between mb-4">
              <div className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                총 <span className={`font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{filteredCurriculums.length}</span>개의 커리큘럼
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredCurriculums.length === 0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportXLSX}
                  disabled={filteredCurriculums.length === 0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </Button>
              </div>
            </div>

            {/* 대량 작업 패널 */}
            {selectedCurriculumIds.length > 0 && (
              <div className={`mb-4 p-4 border rounded-lg ${
                currentTheme === 'dark'
                  ? 'bg-blue-900/20 border-blue-700'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                      {selectedCurriculumIds.length}개 선택됨
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkStatus('active')
                        setIsBulkStatusModalOpen(true)
                      }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      상태 변경
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCurriculumIds([])}
                    >
                      선택 해제
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 커리큘럼 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <tr>
                    <th className="px-4 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectedCurriculumIds.length > 0 && selectedCurriculumIds.length === filteredCurriculums.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      #
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      커리큘럼
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      등록일
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      언어
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      차시
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      생성 수업
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      상태
                    </th>
                    <th className={`px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 divide-gray-700'
                    : 'bg-white divide-gray-200'
                }`}>
                  {paginatedCurriculums.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <svg className={`w-12 h-12 mx-auto mb-4 ${currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {searchTerm || filterLanguage !== 'all'
                            ? '검색 결과가 없습니다'
                            : '커리큘럼이 없습니다'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCurriculums.map((curriculum) => (
                      <tr key={curriculum.id} className={currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCurriculumIds.includes(curriculum.id)}
                            onChange={() => handleSelectCurriculum(curriculum.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {curriculum.id}
                        </td>
                        <td className={`px-6 py-4 text-sm font-medium text-center ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <div className="min-w-[200px] max-w-md mx-auto">
                            <div className="font-semibold">{curriculum.name}</div>
                            <div className={`text-xs mt-1 line-clamp-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{curriculum.description}</div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(curriculum.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant="primary">{curriculum.language}</Badge>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {curriculum.weeks}주
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {curriculum.classCount || 0}개
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {curriculum.status === 'active' ? (
                            <Badge variant="success">활성</Badge>
                          ) : (
                            <Badge variant="gray">보관</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleViewDetails(curriculum)}
                              className="px-2 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors duration-200 text-[11px] flex items-center gap-0.5"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              상세
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(curriculum)}
                              className="px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors duration-200 text-[11px] flex items-center gap-0.5"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              수정
                            </button>
                            <button
                              onClick={() => handleToggleArchive(curriculum)}
                              className={`px-2 py-1 text-white rounded transition-colors duration-200 text-[11px] flex items-center gap-0.5 ${
                                curriculum.status === 'active'
                                  ? 'bg-amber-500 hover:bg-amber-600'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              {curriculum.status === 'active' ? '보관' : '활성'}
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(curriculum)}
                              disabled={curriculum.classCount ? curriculum.classCount > 0 : false}
                              className={`px-2 py-1 rounded transition-colors duration-200 text-[11px] flex items-center gap-0.5 ${
                                curriculum.classCount && curriculum.classCount > 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-rose-500 text-white hover:bg-rose-600'
                              }`}
                              title={curriculum.classCount && curriculum.classCount > 0 ? `${curriculum.classCount}개의 수업과 연결되어 삭제할 수 없습니다` : '커리큘럼 삭제'}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className={`px-6 py-4 border-t ${
                currentTheme === 'dark'
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">{filteredCurriculums.length}</span>개 중{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredCurriculums.length)}
                    </span>
                    개 표시
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        currentPage === 1
                          ? currentTheme === 'dark'
                            ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : currentTheme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        이전
                      </div>
                    </button>

                    <div className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      페이지 <span className="font-medium">{currentPage}</span> /{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        currentPage === totalPages
                          ? currentTheme === 'dark'
                            ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : currentTheme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        다음
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 커리큘럼 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedCurriculum(null)
          setCurriculumDetails(null)
        }}
        title="커리큘럼 상세 정보"
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={100} />
          </div>
        ) : selectedCurriculum && curriculumDetails ? (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 pb-2 border-b ${
                currentTheme === 'dark'
                  ? 'text-white border-gray-700'
                  : 'text-gray-900 border-gray-200'
              }`}>
                기본 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>등록번호</span>
                  <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedCurriculum.id}</span>
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>커리큘럼</span>
                  <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedCurriculum.name}</span>
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>등록일</span>
                  <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedCurriculum.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>언어</span>
                  <Badge variant="primary">{selectedCurriculum.language}</Badge>
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>차시</span>
                  <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedCurriculum.weeks}주</span>
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>생성 된 수업</span>
                  <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{curriculumDetails.classCount || 0}개</span>
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>상태</span>
                  {selectedCurriculum.status === 'active' ? (
                    <Badge variant="success">활성</Badge>
                  ) : (
                    <Badge variant="gray">보관</Badge>
                  )}
                </div>
                <div className="flex items-start">
                  <span className={`text-sm w-28 flex-shrink-0 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>설명</span>
                  <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{selectedCurriculum.description}</span>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div className={`flex items-center justify-end pt-4 border-t ${
              currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setSelectedCurriculum(null)
                  setCurriculumDetails(null)
                }}
              >
                닫기
              </Button>
            </div>
          </div>
        ) : (
          <div className={`text-center py-8 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            커리큘럼 정보를 불러올 수 없습니다.
          </div>
        )}
      </Modal>

      {/* 커리큘럼 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="커리큘럼 생성"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              커리큘럼명 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="예: Java 프로그래밍 기초"
              error={createErrors.createName}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              프로그래밍 언어 <span className="text-red-500">*</span>
            </label>
            <Select
              value={createLanguage}
              onChange={(e) => setCreateLanguage(e.target.value)}
            >
              <option value="">언어를 선택하세요</option>
              <option value="C">C</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
              <option value="C#">C#</option>
            </Select>
            {createErrors.createLanguage && (
              <p className="text-sm text-red-600 mt-1">{createErrors.createLanguage}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              주차 수 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={createWeeks}
              onChange={(e) => setCreateWeeks(e.target.value)}
              placeholder="12"
              min="1"
              max="52"
              error={createErrors.createWeeks}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="커리큘럼에 대한 설명을 입력하세요"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            {createErrors.createDescription && (
              <p className="text-sm text-red-600 mt-1">{createErrors.createDescription}</p>
            )}
          </div>

          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
            currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
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
      </Modal>

      {/* 커리큘럼 수정 - 비밀번호 확인 모달 */}
      <Modal
        isOpen={isEditPasswordModalOpen}
        onClose={() => {
          setIsEditPasswordModalOpen(false)
          setEditPassword('')
          setEditPasswordError('')
        }}
        title="비밀번호 확인"
      >
        <div className="space-y-4">
          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            커리큘럼을 수정하려면 관리자 비밀번호를 입력해주세요.
          </p>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              비밀번호
            </label>
            <Input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isVerifyingEditPassword) {
                  handleVerifyEditPassword()
                }
              }}
              placeholder="관리자 비밀번호를 입력하세요"
              disabled={isVerifyingEditPassword}
            />
            {editPasswordError && (
              <p className="mt-2 text-sm text-error-600">{editPasswordError}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditPasswordModalOpen(false)
                setEditPassword('')
                setEditPasswordError('')
              }}
              disabled={isVerifyingEditPassword}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleVerifyEditPassword}
              disabled={isVerifyingEditPassword}
            >
              {isVerifyingEditPassword ? '확인 중...' : '확인'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 커리큘럼 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="커리큘럼 수정"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              커리큘럼명 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="커리큘럼명 입력"
              error={editErrors.editName}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              프로그래밍 언어
            </label>
            <div className={`px-3 py-2 border rounded-lg ${
              currentTheme === 'dark'
                ? 'bg-gray-800 border-gray-600'
                : 'bg-gray-50 border-gray-300'
            }`}>
              <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{editCurriculum?.language}</p>
            </div>
            <p className={`text-xs mt-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>프로그래밍 언어는 수정할 수 없습니다</p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              주차 수 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={editWeeks}
              onChange={(e) => setEditWeeks(e.target.value)}
              placeholder="12"
              min="1"
              max="52"
              error={editErrors.editWeeks}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="커리큘럼에 대한 설명을 입력하세요"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            {editErrors.editDescription && (
              <p className="text-sm text-red-600 mt-1">{editErrors.editDescription}</p>
            )}
          </div>

          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
            currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isEditing}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleEditCurriculum}
              loading={isEditing}
            >
              수정
            </Button>
          </div>
        </div>
      </Modal>

      {/* 커리큘럼 삭제 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletePassword('')
          setDeleteConfirmName('')
          setDeleteError('')
        }}
        title="커리큘럼 삭제"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-red-900 mb-2">⚠️ 경고</h4>
            <p className="text-sm text-red-800 mb-2">
              <span className="font-bold">{deleteCurriculum?.name}</span> 커리큘럼을 삭제하시겠습니까?
            </p>
            <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
              <li>이 작업은 되돌릴 수 없습니다</li>
              <li>수업과 연결된 커리큘럼은 삭제할 수 없습니다</li>
              {deleteCurriculum?.classCount && deleteCurriculum.classCount > 0 && (
                <li className="font-bold">현재 {deleteCurriculum.classCount}개의 수업과 연결됨</li>
              )}
            </ul>
          </div>

          {/* 관리자 비밀번호 확인 */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              관리자 비밀번호 <span className="text-error-500">*</span>
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="관리자 비밀번호를 입력하세요"
              error={!!deleteError && !deletePassword}
            />
          </div>

          {/* 커리큘럼명 확인 */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              커리큘럼명 확인 <span className="text-error-500">*</span>
            </label>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={`"${deleteCurriculum?.name}" 을(를) 입력하세요`}
              error={!!deleteError && deleteConfirmName !== deleteCurriculum?.name}
            />
            <p className={`mt-1 text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              삭제를 확인하려면 위의 커리큘럼명을 정확히 입력하세요
            </p>
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{deleteError}</p>
            </div>
          )}

          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
            currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletePassword('')
                setDeleteConfirmName('')
                setDeleteError('')
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="error"
              onClick={handleDeleteCurriculum}
              loading={isDeleting}
              disabled={!deletePassword || !deleteConfirmName}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 대량 삭제 확인 모달 */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="대량 삭제 확인"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              선택한 <span className="font-bold">{selectedCurriculumIds.length}개</span>의 커리큘럼을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
            currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              variant="ghost"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={isBulkDeleting}
            >
              취소
            </Button>
            <Button
              variant="error"
              onClick={handleBulkDelete}
              loading={isBulkDeleting}
            >
              {selectedCurriculumIds.length}개 삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 일괄 상태 변경 모달 */}
      <Modal
        isOpen={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        title="일괄 상태 변경"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              선택한 <span className="font-bold">{selectedCurriculumIds.length}개</span>의 커리큘럼 상태를 변경합니다.
            </p>
          </div>

          {/* 상태 선택 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              변경할 상태 <span className="text-error-500">*</span>
            </label>
            <div className="space-y-2">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                currentTheme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="active"
                  checked={bulkStatus === 'active'}
                  onChange={(e) => setBulkStatus(e.target.value as 'active' | 'archived')}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>활성</p>
                  <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>수업 생성 시 선택 가능</p>
                </div>
              </label>
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                currentTheme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="archived"
                  checked={bulkStatus === 'archived'}
                  onChange={(e) => setBulkStatus(e.target.value as 'active' | 'archived')}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>보관</p>
                  <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>더 이상 사용하지 않는 커리큘럼</p>
                </div>
              </label>
            </div>
          </div>

          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${
            currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              variant="ghost"
              onClick={() => setIsBulkStatusModalOpen(false)}
              disabled={isBulkStatusChanging}
            >
              취소
            </Button>
            <Button
              variant={bulkStatus === 'archived' ? 'ghost' : 'primary'}
              onClick={handleBulkStatusChange}
              loading={isBulkStatusChanging}
            >
              변경
            </Button>
          </div>
        </div>
      </Modal>

      {/* 커리큘럼 구조 가이드 모달 (개발 환경 전용) */}
      <Modal
        isOpen={isStructureGuideOpen}
        onClose={() => setIsStructureGuideOpen(false)}
        title="EduVerse 커리큘럼 시나리오 구조 가이드"
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 개요 */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1. 개요</h2>
            <p className={`leading-relaxed ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              이 문서는 EduVerse 플랫폼의 모든 교육 콘텐츠가 따라야 할 <strong>표준 커리큘럼 시나리오 구조</strong>를 정의합니다.
              이 표준 구조는 일관된 고품질의 학습 경험을 제공하고, 향후 새로운 프로그래밍 언어로 커리큘럼을 쉽게 확장할 수 있도록 설계되었습니다.
            </p>
            <p className={`leading-relaxed mt-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              현재 목업 서비스의 시나리오는 4주차 과정으로 기획되었지만, 이 표준 구조는 상용 서비스에서 <strong>1주차부터 최대 16주차까지</strong> 교육 기간을 유동적으로 설계할 수 있는 확장성을 가집니다.
            </p>
          </section>

          {/* 핵심 교육 철학 */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>2. 핵심 교육 철학</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🎮 스토리텔링 기반 학습 (Story-driven Learning)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>모든 학습은 'LogiCore Tech'라는 가상 IT 기업의 신입사원 인턴십 과정이라는 하나의 큰 스토리 안에서 진행됩니다.</li>
                  <li>학습자는 단순한 문제 풀이가 아닌, 실제 업무와 유사한 과제를 해결하며 몰입감을 높입니다.</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🧑‍🏫 3-멘토 시스템 (3-Mentor System)</h3>
                <p className="text-gray-700 text-sm">
                  세 명의 가상 캐릭터(팀장, 선임, 교수)가 각기 다른 관점에서 학습 콘텐츠를 제공하여 입체적인 학습을 유도합니다.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">💻 실습 중심 학습 (Hands-on Practice)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>모든 학습 단위는 실제 코드를 작성하고 실행하는 실습으로 구성됩니다.</li>
                  <li>브라우저 내에서 코드 작성, 실행, 테스트가 모두 가능하여 별도의 개발 환경 설정이 필요 없습니다.</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚡ 즉각적인 피드백 (Instant Feedback)</h3>
                <p className="text-gray-700 text-sm">
                  자동화된 테스트를 통해 코드의 정답 여부를 즉시 확인하고, 성공/실패에 대한 명확하고 구체적인 피드백을 받습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 표준 JSON 구조 */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>3. 표준 JSON 구조</h2>
            <p className={`mb-3 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              모든 커리큘럼 시나리오는 <code className={`px-2 py-1 rounded ${currentTheme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-900'}`}>과정(Course) → 주차(Week) → 학습 사이클(Cycle)</code>의 3단계 계층적 JSON 구조를 가집니다.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className={`font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>3.1 최상위 구조 (Course)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "courseTitle": "LogiCore Tech 신입 개발자 과정",
  "language": "Python",
  "languageVersion": "3.10",
  "installationGuide": {
    "windows": "...",
    "macos": "...",
    "linux": "..."
  },
  "weeks": [
    // 주차별 데이터
  ]
}`}
                </pre>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>3.2 주차별 구조 (Week)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "week": 1,
  "title": "신입사원 온보딩 및 개발 환경 구축",
  "cycles": [
    // 학습 사이클 데이터
  ]
}`}
                </pre>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>3.3 학습 사이클 구조 (Cycle)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "title": "첫 파이썬 프로그램 작성 및 실행",
  "syntax_key": "print_statement",
  "filename": "welcome.py",
  "starterCode": "# 이 파일에 코드를 작성하세요.",
  "testCode": "assert 'expected_output' in result",
  "expectedPrintOutput": "Hello, LogiCore Tech!",
  "task": { "..." },
  "briefing": { "..." },
  "lecture": { "..." },
  "feedback": { "..." }
}`}
                </pre>
                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">title</code>: 해당 사이클의 학습 소주제</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">syntax_key</code>: 학습할 핵심 문법 키워드 (분류 및 검색용)</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">filename</code>: 실습에 사용될 가상 파일명</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">starterCode</code>: 학생에게 제공되는 초기 코드 템플릿</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">task</code>: 팀장(Alex)이 부여하는 실무 과제</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">briefing</code>: 선임(Sena)이 제공하는 실무 팁</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">lecture</code>: 교수(Prof. Kim)가 설명하는 이론 강의</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">feedback</code>: 테스트 결과에 따른 성공/실패 피드백</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 캐릭터 역할 정의 */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>4. 캐릭터 역할 정의 (3-멘토 시스템)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">캐릭터</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">컨셉</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">목적</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Alex (팀장)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">과제 부여</td>
                    <td className="px-4 py-3 text-sm text-gray-700">친근하고 목표 지향적인 리더</td>
                    <td className="px-4 py-3 text-sm text-gray-700"><strong>What</strong>: "무엇을" 해야 하는지 명확한 목표 제시</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Sena (선임)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">실무 OJT</td>
                    <td className="px-4 py-3 text-sm text-gray-700">실용적이고 도움을 주는 동료</td>
                    <td className="px-4 py-3 text-sm text-gray-700"><strong>How</strong>: "어떻게" 문제를 해결하는지 실용적인 팁 제공</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Prof. Kim (교수)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">이론 강의</td>
                    <td className="px-4 py-3 text-sm text-gray-700">전문적이고 깊이 있는 멘토</td>
                    <td className="px-4 py-3 text-sm text-gray-700"><strong>Why</strong>: "왜" 그렇게 동작하는지 이론적 배경과 원리 설명</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 학습 흐름 */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>5. 학습 흐름 (Learning Flow)</h2>
            <p className={`mb-3 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              학생은 하나의 학습 사이클 내에서 다음과 같은 흐름을 따라 학습을 진행합니다:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">🎯 과제 확인 (Alex)</div>
                    <div className="text-sm text-gray-600">팀장이 실무 과제를 부여합니다</div>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-gray-300 h-6"></div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">💡 힌트 습득 (Sena)</div>
                    <div className="text-sm text-gray-600">선임이 실무 팁을 제공합니다</div>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-gray-300 h-6"></div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">📖 이론 학습 (Prof. Kim)</div>
                    <div className="text-sm text-gray-600">교수가 이론적 배경을 설명합니다</div>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-gray-300 h-6"></div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">💻 코드 작성 (학생)</div>
                    <div className="text-sm text-gray-600">학생이 직접 코드를 작성합니다</div>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-gray-300 h-6"></div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">▶️ 실행/테스트</div>
                    <div className="text-sm text-gray-600">자동 테스트를 통해 코드를 검증합니다</div>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-gray-300 h-6"></div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">🎉 피드백</div>
                    <div className="text-sm text-gray-600">성공 시 다음 사이클로, 실패 시 오류 수정 후 재시도</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 언어별 적용 가이드 */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>6. 언어별 적용 가이드</h2>
            <p className={`mb-3 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              이 표준 구조는 다양한 언어에 적용될 수 있으며, 언어의 특성에 따라 일부 필드를 조정해야 합니다.
            </p>

            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">실행 환경</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li><strong>인터프리터 언어 (Python, JavaScript)</strong>: 브라우저 내에서 즉시 실행 (Pyodide, Native JS)</li>
                  <li><strong>컴파일 언어 (C, Java, C#)</strong>: 외부 API(Piston 등)를 통한 컴파일 및 실행</li>
                  <li><strong>마크업 언어 (HTML)</strong>: 브라우저의 렌더링 결과를 DOM으로 분석</li>
                </ul>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">코드 검증 방식</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">expectedPrintOutput</code>: 코드가 특정 문자열을 정확히 출력해야 할 때 사용</li>
                  <li><code className="px-1 py-0.5 bg-gray-100 rounded">testCode</code>: 더 복잡한 로직 검증이 필요할 때 사용 (assert 문 또는 단위 테스트)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 결론 */}
          <section className={`border-t pt-6 ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>7. 결론</h2>
            <p className={`leading-relaxed ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              이 가이드는 EduVerse의 교육 콘텐츠 제작과 플랫폼 개발의 기준이 됩니다.
              모든 팀원은 이 문서를 숙지하여 일관성 있고 확장 가능한 고품질 교육 플랫폼을 함께 만들어가야 합니다.
            </p>
          </section>
        </div>

        <div className={`flex items-center justify-end space-x-3 pt-4 border-t mt-6 ${
          currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            variant="primary"
            onClick={() => setIsStructureGuideOpen(false)}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default CurriculumManagementPage
