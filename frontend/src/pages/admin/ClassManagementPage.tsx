import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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

interface Class {
  id: number
  name: string
  code: string
  department: string
  credits: number
  professor: string
  professorId: number
  totalWeeks: number
  currentWeek: number
  status: 'active' | 'draft' | 'archived'
  createdDate: string
  students: number
  description?: string
}

const ClassManagementPage = () => {
  const navigate = useNavigate()
  const { user, token, isLoading: authLoading } = useAuth()
  const { handleError, handleResponseError } = useApiError({
    onAuthError: () => navigate('/login'),
    onPermissionError: () => navigate('/admin/dashboard'),
  })
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProfessor, setFilterProfessor] = useState('all')

  // 검색 자동완성 - filterFn을 useCallback으로 메모이제이션하여 무한 루프 방지
  const classFilterFn = useCallback(
    (cls: Class, query: string) => {
      const q = query.toLowerCase()
      return (
        cls.name.toLowerCase().includes(q) ||
        cls.code.toLowerCase().includes(q) ||
        cls.professor.toLowerCase().includes(q)
      )
    },
    []
  )

  const { suggestions: classSuggestions } = useClientSearchSuggestions(
    searchTerm,
    classes,
    classFilterFn,
    { debounceDelay: 100, minChars: 1, maxSuggestions: 10 }
  )

  // 고급 필터
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterCreditsMin, setFilterCreditsMin] = useState('')
  const [filterCreditsMax, setFilterCreditsMax] = useState('')

  // 수업 상세 모달
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classDetails, setClassDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // 수업 생성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createCode, setCreateCode] = useState('')
  const [createProfessor, setCreateProfessor] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createCurriculum, setCreateCurriculum] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [professors, setProfessors] = useState<Array<{ id: number; name: string }>>([])
  const [curriculums, setCurriculums] = useState<Array<{ id: number; name: string }>>([])

  // 수업 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editClass, setEditClass] = useState<Class | null>(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editProfessor, setEditProfessor] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCurriculum, setEditCurriculum] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // 수업 삭제 모달
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteClass, setDeleteClass] = useState<Class | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // 학생 관리
  const [classStudents, setClassStudents] = useState<Array<{ id: number; name: string; email: string; enrolledAt: string }>>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [isAddingStudents, setIsAddingStudents] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<Array<{ id: number; name: string; email: string }>>([])
  const [searchStudentTerm, setSearchStudentTerm] = useState('')
  const [studentSortBy, setStudentSortBy] = useState<'name' | 'enrolledAt'>('enrolledAt')
  const [selectedClassStudentIds, setSelectedClassStudentIds] = useState<number[]>([])
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false)
  const [selectedRemoveStudent, setSelectedRemoveStudent] = useState<{ id: number; name: string; email: string } | null>(null)
  const [isRemovingStudent, setIsRemovingStudent] = useState(false)

  // 대량 작업
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkStatusChanging, setIsBulkStatusChanging] = useState(false)

  // 학생 테이블 헤더 체크박스 ref
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

  // 헤더 체크박스의 indeterminate 상태 업데이트
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedClassStudentIds.length > 0 && selectedClassStudentIds.length < classStudents.length
    }
  }, [selectedClassStudentIds, classStudents.length])

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

    fetchClasses()
    fetchProfessors()
    fetchCurriculums()
  }, [user, authLoading, navigate])

  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/classes', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setClasses(data.data.classes)
      } else {
        throw new Error(data.message || '수업 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 교수 목록 조회
  const fetchProfessors = async () => {
    try {
      const response = await fetch('/api/admin/professors', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) return

      const data = await response.json()
      if (data.status === 'success' && Array.isArray(data.data)) {
        setProfessors(data.data)
      }
    } catch (error) {
      console.error('교수 목록 조회 실패:', error)
    }
  }

  // 커리큘럼 목록 조회
  const fetchCurriculums = async () => {
    try {
      const response = await fetch('/api/admin/curriculums', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) return

      const data = await response.json()
      if (data.status === 'success' && Array.isArray(data.data)) {
        setCurriculums(data.data)
      }
    } catch (error) {
      console.error('커리큘럼 목록 조회 실패:', error)
    }
  }

  // 생성 폼 검증
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!createName.trim()) {
      errors.createName = '수업명을 입력해주세요'
    }
    if (!createCode.trim()) {
      errors.createCode = '수업 코드를 입력해주세요'
    }
    if (!createProfessor) {
      errors.createProfessor = '교수를 선택해주세요'
    }
    if (!createCurriculum) {
      errors.createCurriculum = '커리큘럼을 선택해주세요'
    }

    setCreateErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 수업 생성
  const handleCreateClass = async () => {
    if (!validateCreateForm()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName,
          code: createCode,
          professorId: parseInt(createProfessor),
          description: createDescription,
          curriculumId: parseInt(createCurriculum),
        }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('수업이 생성되었습니다', { variant: 'success' })
        setIsCreateModalOpen(false)
        setCreateName('')
        setCreateCode('')
        setCreateProfessor('')
        setCreateDescription('')
        setCreateCurriculum('')
        setCreateErrors({})
        fetchClasses()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  // 수정 모달 열기
  const handleOpenEditModal = (classItem: Class) => {
    setEditClass(classItem)
    setEditName(classItem.name)
    setEditCode(classItem.code)
    setEditProfessor(classItem.professorId.toString())
    setEditDescription(classItem.description || '')
    setEditCurriculum('1') // 기본값 (실제로는 classItem에 curriculumId가 있어야 함)
    setEditErrors({})
    setIsEditModalOpen(true)
  }

  // 수정 폼 검증
  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!editName.trim()) {
      errors.editName = '수업명을 입력해주세요'
    }
    if (!editCode.trim()) {
      errors.editCode = '수업 코드를 입력해주세요'
    }
    if (!editProfessor) {
      errors.editProfessor = '교수를 선택해주세요'
    }
    if (!editCurriculum) {
      errors.editCurriculum = '커리큘럼을 선택해주세요'
    }

    setEditErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 수업 수정
  const handleEditClass = async () => {
    if (!validateEditForm() || !editClass) return

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/classes/${editClass.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          code: editCode,
          professorId: parseInt(editProfessor),
          description: editDescription,
          curriculumId: parseInt(editCurriculum),
        }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('수업이 수정되었습니다', { variant: 'success' })
        setIsEditModalOpen(false)
        setEditClass(null)
        setEditErrors({})
        fetchClasses()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsEditing(false)
    }
  }

  // 삭제 모달 열기
  const handleOpenDeleteModal = (classItem: Class) => {
    setDeleteClass(classItem)
    setDeletePassword('')
    setDeleteError('')
    setIsDeleteModalOpen(true)
  }

  // 수업 삭제
  const handleDeleteClass = async () => {
    if (!deleteClass || !deletePassword.trim()) {
      setDeleteError('비밀번호를 입력해주세요')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/classes/${deleteClass.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('수업이 삭제되었습니다', { variant: 'success' })
        setIsDeleteModalOpen(false)
        setDeleteClass(null)
        setDeletePassword('')
        setDeleteError('')
        fetchClasses()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 학생 목록 조회
  const fetchClassStudents = async (classId: number) => {
    setIsLoadingStudents(true)
    try {
      const response = await fetch(`/api/admin/classes/${classId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        setClassStudents(data.data.students || [])
      }
    } catch (error) {
      console.error('학생 목록 조회 실패:', error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  // 추가 가능한 학생 목록 조회
  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) return

      const data = await response.json()
      if (data.status === 'success') {
        const students = (data.data.users || [])
          .filter((u: any) => u.role === 'student')
          .map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
        setAvailableStudents(students)
      }
    } catch (error) {
      console.error('학생 목록 조회 실패:', error)
    }
  }

  // 학생 추가
  const handleAddStudents = async () => {
    if (!selectedClass || selectedStudentIds.length === 0) return

    setIsAddingStudents(true)
    try {
      const response = await fetch(`/api/admin/classes/${selectedClass.id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast(`${data.data.addedCount}명의 학생이 추가되었습니다`, { variant: 'success' })
        setIsAddStudentModalOpen(false)
        setSelectedStudentIds([])
        fetchClassStudents(selectedClass.id)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsAddingStudents(false)
    }
  }

  // 학생 제거 (개별)
  const handleRemoveStudent = async (studentId: number) => {
    if (!selectedClass) return

    const student = classStudents.find(s => s.id === studentId)
    if (!student) return

    setSelectedRemoveStudent(student)
    setIsRemoveStudentModalOpen(true)
  }

  // 학생 제거 확인
  const handleConfirmRemoveStudent = async () => {
    if (!selectedClass || !selectedRemoveStudent) return

    setIsRemovingStudent(true)
    try {
      const response = await fetch(`/api/admin/classes/${selectedClass.id}/students/${selectedRemoveStudent.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('학생이 제거되었습니다', { variant: 'success' })
        fetchClassStudents(selectedClass.id)
        setIsRemoveStudentModalOpen(false)
        setSelectedRemoveStudent(null)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsRemovingStudent(false)
    }
  }

  // 일괄 학생 제거
  const handleBulkRemoveStudents = async () => {
    if (!selectedClass || selectedClassStudentIds.length === 0) return

    if (!window.confirm(`정말로 ${selectedClassStudentIds.length}명의 학생을 제거하겠습니까?`)) return

    try {
      let removedCount = 0
      for (const studentId of selectedClassStudentIds) {
        const response = await fetch(`/api/admin/classes/${selectedClass.id}/students/${studentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (response.ok) {
          removedCount++
        }
      }

      addToast(`${removedCount}명의 학생이 제거되었습니다`, { variant: 'success' })
      fetchClassStudents(selectedClass.id)
      setSelectedClassStudentIds([])
    } catch (error) {
      handleError(error)
    }
  }

  // CSV 내보내기
  const handleExportCSV = () => {
    const exportData = filteredClasses.map((cls) => ({
      'ID': cls.id,
      '수업명': cls.name,
      '수업코드': cls.code,
      '학과': cls.department,
      '학점': cls.credits,
      '담당교수': cls.professor,
      '상태': getStatusLabel(cls.status),
      '진행률': `${cls.currentWeek}/${cls.totalWeeks}`,
      '수강학생': cls.students,
      '생성일': formatDate(cls.createdDate),
    }))

    const filename = getFilenameWithDate('수업목록', 'csv')
    exportToCSV(exportData, { filename })
    addToast('CSV 파일이 다운로드되었습니다', { variant: 'success' })
  }

  // XLSX 내보내기
  const handleExportXLSX = () => {
    const exportData = filteredClasses.map((cls) => ({
      'ID': cls.id,
      '수업명': cls.name,
      '수업코드': cls.code,
      '학과': cls.department,
      '학점': cls.credits,
      '담당교수': cls.professor,
      '상태': getStatusLabel(cls.status),
      '진행률': `${cls.currentWeek}/${cls.totalWeeks}`,
      '수강학생': cls.students,
      '생성일': formatDate(cls.createdDate),
    }))

    const filename = getFilenameWithDate('수업목록', 'xlsx')
    exportToXLSX(exportData, { filename, sheetName: '수업' })
    addToast('엑셀 파일이 다운로드되었습니다', { variant: 'success' })
  }

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedClassIds.length === filteredClasses.length) {
      setSelectedClassIds([])
    } else {
      setSelectedClassIds(filteredClasses.map((c) => c.id))
    }
  }

  // 개별 선택/해제
  const handleSelectClass = (classId: number) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter((id) => id !== classId))
    } else {
      setSelectedClassIds([...selectedClassIds, classId])
    }
  }

  // 일괄 상태 변경
  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedClassIds.length === 0) return

    setIsBulkStatusChanging(true)
    try {
      // 실제로는 API 호출이 필요하지만, 여기서는 Mock 업데이트
      const updatedClasses = classes.map((cls) => {
        if (selectedClassIds.includes(cls.id)) {
          return { ...cls, status: bulkStatus as 'active' | 'draft' | 'archived' }
        }
        return cls
      })

      setClasses(updatedClasses)
      addToast(`${selectedClassIds.length}개 수업의 상태가 변경되었습니다`, { variant: 'success' })
      setIsBulkStatusModalOpen(false)
      setBulkStatus('')
      setSelectedClassIds([])
    } catch (error) {
      handleError(error)
    } finally {
      setIsBulkStatusChanging(false)
    }
  }

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedClassIds.length === 0) return

    if (!window.confirm(`선택한 ${selectedClassIds.length}개의 수업을 정말로 삭제하시겠습니까?`)) return

    setIsBulkDeleting(true)
    try {
      // 실제로는 API 호출이 필요하지만, 여기서는 Mock 업데이트
      const remainingClasses = classes.filter((cls) => !selectedClassIds.includes(cls.id))

      setClasses(remainingClasses)
      addToast(`${selectedClassIds.length}개 수업이 삭제되었습니다`, { variant: 'success' })
      setSelectedClassIds([])
    } catch (error) {
      handleError(error)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterProfessor('all')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterCreditsMin('')
    setFilterCreditsMax('')
    addToast('필터가 초기화되었습니다', { variant: 'success' })
  }

  const fetchClassDetails = async (classId: number) => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setClassDetails(data.data)
      } else {
        throw new Error(data.message || '수업 상세 정보 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem)
    setClassDetails(null)
    setIsDetailModalOpen(true)
    fetchClassDetails(classItem.id)
    fetchClassStudents(classItem.id)
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

          {/* 탭 스켈레톤 */}
          <div className="flex space-x-2">
            <Skeleton variant="rectangular" width={80} height={40} />
            <Skeleton variant="rectangular" width={80} height={40} />
          </div>

          {/* 통계 카드 스켈레톤 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
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

          {/* 수업 카드 스켈레톤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.professor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    const matchesProfessor = filterProfessor === 'all' || c.professorId.toString() === filterProfessor

    // 날짜 범위 필터
    let matchesDateRange = true
    if (filterDateFrom || filterDateTo) {
      const classDate = new Date(c.createdDate)
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom)
        matchesDateRange = matchesDateRange && classDate >= fromDate
      }
      if (filterDateTo) {
        const toDate = new Date(filterDateTo)
        toDate.setHours(23, 59, 59, 999) // 해당 날짜 끝까지 포함
        matchesDateRange = matchesDateRange && classDate <= toDate
      }
    }

    // 학점 범위 필터
    let matchesCreditsRange = true
    if (filterCreditsMin || filterCreditsMax) {
      if (filterCreditsMin) {
        matchesCreditsRange = matchesCreditsRange && c.credits >= parseInt(filterCreditsMin)
      }
      if (filterCreditsMax) {
        matchesCreditsRange = matchesCreditsRange && c.credits <= parseInt(filterCreditsMax)
      }
    }

    return matchesSearch && matchesStatus && matchesProfessor && matchesDateRange && matchesCreditsRange
  })

  // 학생 필터링 및 정렬
  const filteredAndSortedStudents = classStudents
    .filter((s) =>
      s.name.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudentTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (studentSortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
      }
    })

  // 가용 학생 필터링
  const filteredAvailableStudents = availableStudents
    .filter((s) =>
      s.name.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudentTerm.toLowerCase())
    )
    .filter((s) => !classStudents.find((cs) => cs.id === s.id))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'draft':
        return 'warning'
      case 'archived':
        return 'secondary'
      default:
        return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '진행 중'
      case 'draft':
        return '준비 중'
      case 'archived':
        return '완료됨'
      default:
        return '알 수 없음'
    }
  }

  // 통계
  const totalClasses = classes.length
  const activeClasses = classes.filter((c) => c.status === 'active').length
  const draftClasses = classes.filter((c) => c.status === 'draft').length
  const archivedClasses = classes.filter((c) => c.status === 'archived').length
  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">수업 관리</h1>
            <p className="mt-1 text-sm text-gray-600">모든 수업의 현황을 확인하고 관리하세요</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setCreateName('')
              setCreateCode('')
              setCreateProfessor('')
              setCreateDescription('')
              setCreateCurriculum('')
              setCreateErrors({})
              setIsCreateModalOpen(true)
            }}
          >
            수업 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 수업</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totalClasses}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">진행 중</p>
                  <p className="mt-2 text-3xl font-bold text-success-600">{activeClasses}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">준비 중</p>
                  <p className="mt-2 text-3xl font-bold text-warning-600">{draftClasses}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">완료됨</p>
                  <p className="mt-2 text-3xl font-bold text-gray-600">{archivedClasses}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">수강 학생</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                  onSelect={(cls) => {
                    setSearchTerm(cls.name)
                  }}
                  suggestions={classSuggestions}
                  isLoading={false}
                  placeholder="수업명, 수업코드, 교수명으로 검색..."
                  renderSuggestion={(cls) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{cls.name}</span>
                      <span className="text-xs text-gray-500">{cls.code} • {cls.professor}</span>
                    </div>
                  )}
                  getSuggestionKey={(cls) => cls.id}
                  getSuggestionValue={(cls) => cls.name}
                  minCharsToShow={1}
                  maxSuggestions={10}
                />
              </div>
              <select
                value={filterProfessor}
                onChange={(e) => setFilterProfessor(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              >
                <option value="all">전체 교수</option>
                {professors.map((prof) => (
                  <option key={prof.id} value={prof.id.toString()}>
                    {prof.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              >
                <option value="all">모두 보기</option>
                <option value="active">진행 중</option>
                <option value="draft">준비 중</option>
                <option value="archived">완료됨</option>
              </select>

              {/* 고급 필터 토글 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                고급 필터
                {showAdvancedFilters ? (
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Button>

              {/* 필터 초기화 버튼 */}
              {(searchTerm || filterStatus !== 'all' || filterProfessor !== 'all' || filterDateFrom || filterDateTo || filterCreditsMin || filterCreditsMax) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  필터 초기화
                </Button>
              )}
            </div>

            {/* 고급 필터 패널 */}
            {showAdvancedFilters && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 날짜 범위 필터 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      생성일 범위
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                        placeholder="시작일"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                        placeholder="종료일"
                      />
                    </div>
                  </div>

                  {/* 학점 범위 필터 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      학점 범위
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={filterCreditsMin}
                        onChange={(e) => setFilterCreditsMin(e.target.value)}
                        min="0"
                        max="9"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                        placeholder="최소"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="number"
                        value={filterCreditsMax}
                        onChange={(e) => setFilterCreditsMax(e.target.value)}
                        min="0"
                        max="9"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                        placeholder="최대"
                      />
                    </div>
                  </div>
                </div>

                {/* 활성 필터 표시 */}
                {(filterDateFrom || filterDateTo || filterCreditsMin || filterCreditsMax) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-xs font-medium text-gray-600">활성 필터:</span>
                      {filterDateFrom && (
                        <Badge variant="info" size="sm">
                          {filterDateFrom}부터
                        </Badge>
                      )}
                      {filterDateTo && (
                        <Badge variant="info" size="sm">
                          {filterDateTo}까지
                        </Badge>
                      )}
                      {filterCreditsMin && (
                        <Badge variant="purple" size="sm">
                          학점 {filterCreditsMin}학점 이상
                        </Badge>
                      )}
                      {filterCreditsMax && (
                        <Badge variant="purple" size="sm">
                          학점 {filterCreditsMax}학점 이하
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 결과 및 내보내기 */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  총 <span className="font-semibold text-gray-900">{filteredClasses.length}</span>개의 수업
                </div>
                {selectedClassIds.length > 0 && (
                  <div className="text-sm text-primary-600 font-medium">
                    {selectedClassIds.length}개 선택됨
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {selectedClassIds.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBulkStatus('')
                        setIsBulkStatusModalOpen(true)
                      }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      상태 변경
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      loading={isBulkDeleting}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredClasses.length === 0}
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
                  disabled={filteredClasses.length === 0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </Button>
              </div>
            </div>

            {/* 수업 목록 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-center font-medium text-gray-700 w-12">
                      <input
                        type="checkbox"
                        checked={selectedClassIds.length === filteredClasses.length && filteredClasses.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">수업명</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">수업코드</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">교수</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">학점</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">진행률</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">학생</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">상태</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls, index) => (
                      <tr key={cls.id} className={index !== filteredClasses.length - 1 ? 'border-b border-gray-100' : ''}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(cls.id)}
                            onChange={() => handleSelectClass(cls.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div>
                            <p className="font-medium text-gray-900">{cls.name}</p>
                            <p className="text-xs text-gray-500">{cls.department}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-700">{cls.code}</td>
                        <td className="px-4 py-4 text-center text-gray-700">{cls.professor}</td>
                        <td className="px-4 py-4 text-center text-gray-700">{cls.credits}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-600 rounded-full"
                                style={{ width: `${(cls.currentWeek / cls.totalWeeks) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{cls.currentWeek}/{cls.totalWeeks}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-700">{cls.students}</td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={getStatusColor(cls.status)}>
                            {getStatusLabel(cls.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(cls)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                            >
                              상세
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(cls)}
                              className="text-green-600 hover:text-green-800 font-medium text-xs"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(cls)}
                              className="text-red-600 hover:text-red-800 font-medium text-xs"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* 수업 상세 조회 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedClass(null)
          setClassDetails(null)
        }}
        title="수업 상세 정보"
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={100} />
          </div>
        ) : selectedClass && classDetails ? (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                기본 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">수업명:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedClass.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">수업코드:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedClass.code}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">학과:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedClass.department}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">학점:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedClass.credits}학점</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">담당 교수:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedClass.professor}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">상태:</span>
                  <Badge variant={getStatusColor(selectedClass.status)}>
                    {getStatusLabel(selectedClass.status)}
                  </Badge>
                </div>
                {selectedClass.description && (
                  <div className="flex items-start">
                    <span className="text-sm text-gray-600 w-28 flex-shrink-0">설명:</span>
                    <span className="text-sm text-gray-700">{selectedClass.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 진행 상태 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                진행 상태
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">주차 진행:</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all"
                          style={{ width: `${(selectedClass.currentWeek / selectedClass.totalWeeks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedClass.currentWeek} / {selectedClass.totalWeeks}주
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">생성일:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(selectedClass.createdDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 수강 학생 정보 */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  수강 학생 정보 ({classStudents.length}명)
                </h3>
                <div className="flex gap-2">
                  {selectedClassStudentIds.length > 0 && (
                    <Button
                      variant="error"
                      size="sm"
                      onClick={handleBulkRemoveStudents}
                    >
                      선택 ({selectedClassStudentIds.length}) 제거
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedStudentIds([])
                      setSearchStudentTerm('')
                      fetchAvailableStudents()
                      setIsAddStudentModalOpen(true)
                    }}
                  >
                    학생 추가
                  </Button>
                </div>
              </div>

              {/* 정렬 옵션 */}
              {classStudents.length > 0 && (
                <div className="mb-3 flex gap-2">
                  <select
                    value={studentSortBy}
                    onChange={(e) => setStudentSortBy(e.target.value as 'name' | 'enrolledAt')}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="enrolledAt">등록일 (최신순)</option>
                    <option value="name">이름순</option>
                  </select>
                </div>
              )}

              {isLoadingStudents ? (
                <Skeleton variant="rectangular" height={120} />
              ) : classStudents.length > 0 ? (
                <div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left w-6">
                            <input
                              ref={headerCheckboxRef}
                              type="checkbox"
                              checked={selectedClassStudentIds.length === classStudents.length && classStudents.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClassStudentIds(classStudents.map(s => s.id))
                                } else {
                                  setSelectedClassStudentIds([])
                                }
                              }}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">이름</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">이메일</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">등록일</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredAndSortedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedClassStudentIds.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedClassStudentIds([...selectedClassStudentIds, student.id])
                                  } else {
                                    setSelectedClassStudentIds(selectedClassStudentIds.filter(id => id !== student.id))
                                  }
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 text-gray-900 font-medium">{student.name}</td>
                            <td className="px-3 py-2 text-gray-600 text-xs">{student.email}</td>
                            <td className="px-3 py-2 text-gray-600 text-xs">
                              {new Date(student.enrolledAt).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => handleRemoveStudent(student.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-xs"
                              >
                                제거
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
                  수강 학생이 없습니다
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setSelectedClass(null)
                  setClassDetails(null)
                }}
              >
                닫기
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            수업 정보를 불러올 수 없습니다.
          </div>
        )}
      </Modal>

      {/* 수업 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="수업 생성"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업명 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="수업명 입력"
              error={createErrors.createName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 코드 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={createCode}
              onChange={(e) => setCreateCode(e.target.value)}
              placeholder="수업 코드 입력"
              error={createErrors.createCode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교수 <span className="text-red-500">*</span>
            </label>
            <Select
              value={createProfessor}
              onChange={(e) => setCreateProfessor(e.target.value)}
            >
              <option value="">교수를 선택하세요</option>
              {professors.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </Select>
            {createErrors.createProfessor && (
              <p className="text-sm text-red-600 mt-1">{createErrors.createProfessor}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              커리큘럼 <span className="text-red-500">*</span>
            </label>
            <Select
              value={createCurriculum}
              onChange={(e) => setCreateCurriculum(e.target.value)}
            >
              <option value="">커리큘럼을 선택하세요</option>
              {curriculums.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.name}
                </option>
              ))}
            </Select>
            {createErrors.createCurriculum && (
              <p className="text-sm text-red-600 mt-1">{createErrors.createCurriculum}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="수업 설명 입력"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateClass}
              loading={isCreating}
            >
              생성
            </Button>
          </div>
        </div>
      </Modal>

      {/* 수업 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="수업 수정"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업명 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="수업명 입력"
              error={editErrors.editName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 코드 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              placeholder="수업 코드 입력"
              error={editErrors.editCode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교수 <span className="text-red-500">*</span>
            </label>
            <Select
              value={editProfessor}
              onChange={(e) => setEditProfessor(e.target.value)}
            >
              <option value="">교수를 선택하세요</option>
              {professors.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </Select>
            {editErrors.editProfessor && (
              <p className="text-sm text-red-600 mt-1">{editErrors.editProfessor}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              커리큘럼 <span className="text-red-500">*</span>
            </label>
            <Select
              value={editCurriculum}
              onChange={(e) => setEditCurriculum(e.target.value)}
            >
              <option value="">커리큘럼을 선택하세요</option>
              {curriculums.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.name}
                </option>
              ))}
            </Select>
            {editErrors.editCurriculum && (
              <p className="text-sm text-red-600 mt-1">{editErrors.editCurriculum}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="수업 설명 입력"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isEditing}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleEditClass}
              loading={isEditing}
            >
              수정
            </Button>
          </div>
        </div>
      </Modal>

      {/* 수업 삭제 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="수업 삭제"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-bold">{deleteClass?.name}</span> 수업을 정말로 삭제하겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
            {deleteError && (
              <p className="text-sm text-red-600 mt-1">{deleteError}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="error"
              onClick={handleDeleteClass}
              loading={isDeleting}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 학생 추가 모달 */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => {
          setIsAddStudentModalOpen(false)
          setSearchStudentTerm('')
        }}
        title="학생 추가"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{selectedClass?.name}</span> 수업에 추가할 학생을 선택하세요.
            </p>
          </div>

          {/* 검색 필드 */}
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="학생 이름이나 이메일로 검색..."
              value={searchStudentTerm}
              onChange={(e) => setSearchStudentTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            />
            {searchStudentTerm && (
              <button
                onClick={() => setSearchStudentTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* 학생 목록 (체크박스) */}
          <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            {filteredAvailableStudents.length > 0 ? (
              <div className="space-y-2">
                {filteredAvailableStudents.map((student) => (
                  <div key={student.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, student.id])
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                    <label
                      htmlFor={`student-${student.id}`}
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                추가할 학생이 없습니다.
              </div>
            )}
          </div>

          {/* 선택 정보 및 모두 선택 버튼 */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              총 <span className="font-bold">{selectedStudentIds.length}</span>명의 학생이 선택되었습니다.
            </p>
            <div className="flex gap-2">
              {selectedStudentIds.length !== filteredAvailableStudents.length && filteredAvailableStudents.length > 0 && (
                <button
                  onClick={() => setSelectedStudentIds(filteredAvailableStudents.map(s => s.id))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  모두 선택
                </button>
              )}
              {selectedStudentIds.length > 0 && (
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  선택 해제
                </button>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddStudentModalOpen(false)
                setSearchStudentTerm('')
                setSelectedStudentIds([])
              }}
              disabled={isAddingStudents}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAddStudents}
              disabled={selectedStudentIds.length === 0}
              loading={isAddingStudents}
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>

      {/* 학생 제거 확인 모달 */}
      <Modal
        isOpen={isRemoveStudentModalOpen}
        onClose={() => {
          setIsRemoveStudentModalOpen(false)
          setSelectedRemoveStudent(null)
        }}
        title="학생 제거"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              정말로 이 학생을 제거하겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          {selectedRemoveStudent && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">학생 이름</p>
                <p className="font-medium text-gray-900">{selectedRemoveStudent.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">이메일</p>
                <p className="font-medium text-gray-900">{selectedRemoveStudent.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setIsRemoveStudentModalOpen(false)
                setSelectedRemoveStudent(null)
              }}
              disabled={isRemovingStudent}
            >
              취소
            </Button>
            <Button
              variant="error"
              onClick={handleConfirmRemoveStudent}
              loading={isRemovingStudent}
            >
              제거
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
              선택한 <span className="font-bold">{selectedClassIds.length}</span>개 수업의 상태를 변경합니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              변경할 상태 <span className="text-red-500">*</span>
            </label>
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              <option value="">상태를 선택하세요</option>
              <option value="active">진행 중</option>
              <option value="draft">준비 중</option>
              <option value="archived">완료됨</option>
            </Select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setIsBulkStatusModalOpen(false)}
              disabled={isBulkStatusChanging}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkStatusChange}
              disabled={!bulkStatus}
              loading={isBulkStatusChanging}
            >
              변경
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default ClassManagementPage
