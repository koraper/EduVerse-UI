import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Autocomplete from '@/components/common/Autocomplete'
import Select from '@/components/common/Select'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import Loading from '@/components/common/Loading'
import { StatCardSkeleton, UserTableSkeleton } from '@/components/common/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions'
import { exportToCSV, exportToXLSX, getFilenameWithDate, formatDate } from '@/utils/export'

interface User {
  id: number
  email: string
  name: string
  role: 'student' | 'professor' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

const UserManagementPage = () => {
  const navigate = useNavigate()
  const { user: currentUser, token, isLoading: authLoading } = useAuth()
  const { handleResponseError, handleError } = useApiError({
    onAuthError: () => navigate('/login'),
    onPermissionError: () => navigate('/admin/dashboard'),
  })
  const { addToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // 검색 자동완성 - fetchFn을 useCallback으로 메모이제이션하여 무한 루프 방지
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!token) return []
      try {
        const params = new URLSearchParams({
          search: query.trim(),
          limit: '10',
        })
        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await response.json()
        return data.data || []
      } catch (err) {
        return []
      }
    },
    [token]
  )

  const { suggestions: searchSuggestions, isLoading: isSuggestionsLoading } = useSearchSuggestions(
    searchQuery,
    fetchSuggestions,
    { debounceDelay: 300, minChars: 1, maxSuggestions: 10 }
  )

  // Debounced 검색어 (1초 지연)
  const debouncedSearchQuery = useDebounce(searchQuery, 1000)

  // 서버 사이드 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // 페이지당 10개 항목
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // 상태 변경 모달
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('suspended')
  const [statusReason, setStatusReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // 사용자 상세보기 모달
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailUser, setDetailUser] = useState<User | null>(null)

  // 사용자 삭제 모달
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // 사용자 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<'student' | 'professor' | 'admin'>('student')
  const [isEditing, setIsEditing] = useState(false)

  // 사용자 생성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createName, setCreateName] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState<'student' | 'professor'>('student')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // 내보내기 상태
  const [isExporting, setIsExporting] = useState(false)

  // 대량 작업 상태
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive' | 'suspended'>('active')
  const [bulkStatusReason, setBulkStatusReason] = useState('')
  const [isBulkStatusChanging, setIsBulkStatusChanging] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [bulkDeletePassword, setBulkDeletePassword] = useState('')
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading) {
      return
    }

    // 관리자가 아니면 역할별 대시보드로 리다이렉트
    if (currentUser && currentUser.role !== 'admin') {
      if (currentUser.role === 'professor') {
        navigate('/professor/dashboard')
      } else if (currentUser.role === 'student') {
        navigate('/student/dashboard')
      }
      return
    }

    // 비인증 사용자 리다이렉트
    if (!currentUser) {
      navigate('/login')
      return
    }

    fetchUsers()
  }, [currentUser, authLoading, navigate])

  useEffect(() => {
    // 필터 변경 시 첫 페이지로 이동하고 데이터 다시 가져오기
    setCurrentPage(1)
  }, [debouncedSearchQuery, roleFilter, statusFilter])

  useEffect(() => {
    // 페이지나 필터가 변경되면 서버에서 데이터 가져오기
    fetchUsers()
  }, [currentPage, debouncedSearchQuery, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // 서버 사이드 페이지네이션 및 필터링을 위한 쿼리 파라미터 구성
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })

      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim())
      }
      if (roleFilter !== 'all') {
        params.append('role', roleFilter)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      // 응답 상태 코드 검증
      if (!response.ok) {
        await handleResponseError(response)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setUsers(data.data.users)
        setTotalUsers(data.data.pagination?.total || data.data.users.length)
        setTotalPages(data.data.pagination?.totalPages || Math.ceil(data.data.users.length / itemsPerPage))
      } else {
        throw new Error(data.message || '사용자 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자 생성 함수
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // 이름 검증
    if (!createName.trim()) {
      errors.createName = '이름을 입력해주세요'
    } else if (createName.length > 50) {
      errors.createName = '이름은 50자 이내여야 합니다'
    }

    // 이메일 검증
    if (!createEmail.trim()) {
      errors.createEmail = '이메일을 입력해주세요'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createEmail)) {
      errors.createEmail = '유효한 이메일 주소를 입력해주세요'
    }

    // 비밀번호 검증
    if (!createPassword.trim()) {
      errors.createPassword = '비밀번호를 입력해주세요'
    } else if (createPassword.length < 6) {
      errors.createPassword = '비밀번호는 6자 이상이어야 합니다'
    } else if (createPassword.length > 50) {
      errors.createPassword = '비밀번호는 50자 이내여야 합니다'
    }

    setCreateErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    if (!validateCreateForm()) {
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName,
          email: createEmail,
          password: createPassword,
          role: createRole,
        }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        setIsCreating(false)
        return
      }

      const data = await response.json()
      if (data.status === 'success') {
        addToast('사용자가 생성되었습니다', { variant: 'success' })
        setIsCreateModalOpen(false)
        setCreateEmail('')
        setCreateName('')
        setCreatePassword('')
        setCreateRole('student')
        setCreateErrors({})
        // 첫 페이지로 이동해서 새로운 사용자 확인
        setCurrentPage(1)
        await fetchUsers()
      } else {
        throw new Error(data.message || '사용자 생성에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenCreateModal = () => {
    setCreateEmail('')
    setCreateName('')
    setCreatePassword('')
    setCreateRole('student')
    setCreateErrors({})
    setIsCreateModalOpen(true)
  }

  const handleChangeUserStatus = (user: User) => {
    setSelectedUser(user)
    setNewStatus(user.status === 'active' ? 'suspended' : 'active') // 기본값: 현재 상태의 반대
    setStatusReason('')
    setIsStatusModalOpen(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return

    // 정지로 변경 시에만 사유 필수
    if (newStatus === 'suspended' && !statusReason.trim()) {
      addToast('정지 사유를 입력해주세요', { variant: 'warning' })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, reason: statusReason }),
      })

      // 응답 상태 코드 검증
      if (!response.ok) {
        await handleResponseError(response)
        setIsUpdating(false)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setIsStatusModalOpen(false)
        setSelectedUser(null)
        setNewStatus('suspended')
        setStatusReason('')

        // 로그 저장 여부 확인
        if (data.data?.logCreated) {
          addToast('사용자 상태가 변경되었습니다 (관리 로그 기록됨)', { variant: 'success' })
        } else {
          addToast('사용자 상태가 변경되었습니다', { variant: 'success' })
          console.warn('관리 로그가 기록되지 않았습니다:', data.data)
        }

        fetchUsers()
      } else {
        throw new Error(data.message || '사용자 상태 변경에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="purple">관리자</Badge>
      case 'professor':
        return <Badge variant="blue">교수</Badge>
      case 'student':
        return <Badge variant="success">학생</Badge>
      default:
        return <Badge variant="gray">-</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">활성</Badge>
      case 'inactive':
        return <Badge variant="gray">비활성</Badge>
      case 'suspended':
        return <Badge variant="error">정지</Badge>
      default:
        return <Badge variant="gray">-</Badge>
    }
  }

  const getStats = () => {
    // 서버에서 받은 전체 통계 사용 (필터링 전 전체 사용자 수)
    // 로컬 users는 현재 페이지의 사용자만 포함하므로 totalUsers 사용
    const total = totalUsers
    const students = users.filter((u) => u.role === 'student').length
    const professors = users.filter((u) => u.role === 'professor').length
    const admins = users.filter((u) => u.role === 'admin').length
    return { total, students, professors, admins }
  }

  const handleViewDetail = (user: User) => {
    setDetailUser(user)
    setIsDetailModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user)
    setDeletePassword('')
    setDeleteConfirmName('')
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteUser) return

    // 비밀번호 검증 (최소 3자)
    if (!deletePassword || deletePassword.length < 3) {
      addToast('비밀번호를 3자 이상 입력해주세요', { variant: 'warning' })
      return
    }

    // 사용자 이름 확인 (공백 제거 후 비교)
    if (deleteConfirmName.trim() !== deleteUser.name) {
      addToast('사용자 이름이 일치하지 않습니다', { variant: 'warning' })
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        setIsDeleting(false)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setIsDeleteModalOpen(false)
        setDeleteUser(null)
        setDeletePassword('')
        setDeleteConfirmName('')

        addToast('사용자가 삭제되었습니다', { variant: 'success' })
        fetchUsers()
      } else {
        throw new Error(data.message || '사용자 삭제에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
    setIsEditModalOpen(true)
  }

  const handleConfirmEdit = async () => {
    if (!editUser) return

    // 입력 검증
    if (!editName.trim()) {
      addToast('이름을 입력해주세요', { variant: 'warning' })
      return
    }

    if (editName.trim().length < 2 || editName.trim().length > 50) {
      addToast('이름은 2-50자 사이여야 합니다', { variant: 'warning' })
      return
    }

    if (!editEmail.trim()) {
      addToast('이메일을 입력해주세요', { variant: 'warning' })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editEmail.trim())) {
      addToast('올바른 이메일 형식이 아닙니다', { variant: 'warning' })
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
        }),
      })

      if (!response.ok) {
        await handleResponseError(response)
        setIsEditing(false)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setIsEditModalOpen(false)
        setEditUser(null)
        setEditName('')
        setEditEmail('')
        setEditRole('student')

        addToast('사용자 정보가 수정되었습니다', { variant: 'success' })
        fetchUsers()
      } else {
        throw new Error(data.message || '사용자 정보 수정에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsEditing(false)
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '없음'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  // 내보내기 함수
  const handleExportCSV = async () => {
    if (users.length === 0) {
      addToast('내보낼 데이터가 없습니다', { variant: 'warning' })
      return
    }

    setIsExporting(true)
    try {
      // 내보낼 데이터 포맷팅 (한글 역할, 상태 이름 사용)
      const exportData = users.map((user) => ({
        ID: user.id,
        이름: user.name,
        이메일: user.email,
        역할: user.role === 'admin' ? '관리자' : user.role === 'professor' ? '교수' : '학생',
        상태: user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지',
        이메일인증: user.emailVerified ? '인증됨' : '미인증',
        마지막로그인: formatDate(user.lastLoginAt || ''),
        가입일: formatDate(user.createdAt),
      }))

      const filename = getFilenameWithDate('사용자관리', 'csv')
      exportToCSV(exportData, { filename })
      addToast('CSV 파일이 다운로드되었습니다', { variant: 'success' })
    } catch (error) {
      console.error('CSV 내보내기 실패:', error)
      addToast('CSV 내보내기에 실패했습니다', { variant: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportXLSX = async () => {
    if (users.length === 0) {
      addToast('내보낼 데이터가 없습니다', { variant: 'warning' })
      return
    }

    setIsExporting(true)
    try {
      // 내보낼 데이터 포맷팅
      const exportData = users.map((user) => ({
        ID: user.id,
        이름: user.name,
        이메일: user.email,
        역할: user.role === 'admin' ? '관리자' : user.role === 'professor' ? '교수' : '학생',
        상태: user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지',
        이메일인증: user.emailVerified ? '인증됨' : '미인증',
        마지막로그인: formatDate(user.lastLoginAt || ''),
        가입일: formatDate(user.createdAt),
      }))

      const filename = getFilenameWithDate('사용자관리', 'xlsx')
      exportToXLSX(exportData, { filename, sheetName: '사용자' })
      addToast('XLSX 파일이 다운로드되었습니다', { variant: 'success' })
    } catch (error) {
      console.error('XLSX 내보내기 실패:', error)
      addToast('XLSX 내보내기에 실패했습니다', { variant: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([])
    } else {
      // 현재 사용자와 관리자를 제외한 사용자만 선택
      const selectableUsers = users.filter(u => u.id !== currentUser?.id && u.role !== 'admin')
      setSelectedUserIds(selectableUsers.map(u => u.id))
    }
  }

  // 개별 선택/해제
  const handleSelectUser = (userId: number) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId))
    } else {
      setSelectedUserIds([...selectedUserIds, userId])
    }
  }

  // 일괄 상태 변경
  const handleBulkStatusChange = async () => {
    if (selectedUserIds.length === 0) {
      addToast('선택된 사용자가 없습니다', { variant: 'warning' })
      return
    }

    if (bulkStatus === 'suspended' && !bulkStatusReason.trim()) {
      addToast('정지 사유를 입력해주세요', { variant: 'warning' })
      return
    }

    setIsBulkStatusChanging(true)
    try {
      // 각 사용자에 대해 상태 변경 API 호출
      const promises = selectedUserIds.map(userId =>
        fetch(`/api/admin/users/${userId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: bulkStatus, reason: bulkStatusReason }),
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        addToast(`${successCount}명의 사용자 상태가 변경되었습니다${failCount > 0 ? ` (${failCount}명 실패)` : ''}`, {
          variant: failCount > 0 ? 'warning' : 'success'
        })
        setIsBulkStatusModalOpen(false)
        setBulkStatus('active')
        setBulkStatusReason('')
        setSelectedUserIds([])
        fetchUsers()
      } else {
        throw new Error('모든 사용자 상태 변경에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsBulkStatusChanging(false)
    }
  }

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) {
      addToast('선택된 사용자가 없습니다', { variant: 'warning' })
      return
    }

    if (!bulkDeletePassword || bulkDeletePassword.length < 3) {
      addToast('비밀번호를 3자 이상 입력해주세요', { variant: 'warning' })
      return
    }

    setIsBulkDeleting(true)
    try {
      // 각 사용자에 대해 삭제 API 호출
      const promises = selectedUserIds.map(userId =>
        fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ password: bulkDeletePassword }),
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        addToast(`${successCount}명의 사용자가 삭제되었습니다${failCount > 0 ? ` (${failCount}명 실패)` : ''}`, {
          variant: failCount > 0 ? 'warning' : 'success'
        })
        setIsBulkDeleteModalOpen(false)
        setBulkDeletePassword('')
        setSelectedUserIds([])
        fetchUsers()
      } else {
        throw new Error('모든 사용자 삭제에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const stats = getStats()

  // 스켈레톤 UI 렌더링 (인증 로딩 중 또는 데이터 로딩 중)
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* 헤더 */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">사용자 관리</h1>
            <p className="mt-1 text-sm text-gray-600">전체 사용자를 조회하고 관리하세요</p>
          </div>

          {/* 통계 스켈레톤 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* 필터 스켈레톤 */}
          <Card>
            <div className="p-4">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </Card>

          {/* 테이블 스켈레톤 */}
          <Card>
            <UserTableSkeleton rows={10} />
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">사용자 관리</h1>
            <p className="mt-1 text-sm text-gray-600">전체 사용자를 조회하고 관리하세요</p>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="whitespace-nowrap"
          >
            사용자 추가
          </Button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">전체</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">학생</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{stats.students}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">교수</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.professors}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">관리자</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.admins}</p>
            </div>
          </Card>
        </div>

        {/* 필터 */}
        <Card>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Autocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={(user) => {
                    setSearchQuery(user.email)
                    setCurrentPage(1)
                  }}
                  suggestions={searchSuggestions}
                  isLoading={isSuggestionsLoading}
                  placeholder="이메일 또는 이름 검색..."
                  renderSuggestion={(user) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  )}
                  getSuggestionKey={(user) => user.id}
                  getSuggestionValue={(user) => user.email}
                  minCharsToShow={1}
                  maxSuggestions={10}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">전체 역할</option>
                  <option value="student">학생</option>
                  <option value="professor">교수</option>
                  <option value="admin">관리자</option>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">전체 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="suspended">정지</option>
                </Select>
              </div>
            </div>

            {/* 내보내기 & 대량 작업 버튼 */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              {/* 내보내기 버튼 */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isExporting || users.length === 0}
                >
                  CSV 내보내기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportXLSX}
                  disabled={isExporting || users.length === 0}
                >
                  XLSX 내보내기
                </Button>
              </div>

              {/* 대량 작업 버튼 */}
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedUserIds.length}명 선택됨
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkStatus('active')
                        setBulkStatusReason('')
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
                      onClick={() => {
                        setBulkDeletePassword('')
                        setIsBulkDeleteModalOpen(true)
                      }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserIds([])}
                    >
                      선택 해제
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 사용자 테이블 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length > 0 && selectedUserIds.length === users.filter(u => u.id !== currentUser?.id && u.role !== 'admin').length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    인증
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    마지막 로그인
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                        ? '검색 결과가 없습니다'
                        : '사용자가 없습니다'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelectable = user.id !== currentUser?.id && user.role !== 'admin'
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-center">
                          {isSelectable ? (
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {user.id}
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center text-sm text-success-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            인증됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            미인증
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '로그인 기록 없음'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            상세
                          </button>
                          {user.id !== currentUser?.id && user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-success-600 hover:text-success-800 font-medium"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleChangeUserStatus(user)}
                                className="text-primary-600 hover:text-primary-800 font-medium"
                              >
                                상태
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-error-600 hover:text-error-800 font-medium"
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{totalUsers}</span>개 중{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalUsers)}
                  </span>
                  개 표시
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
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

                  <div className="text-sm text-gray-700">
                    페이지 <span className="font-medium">{currentPage}</span> /{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
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
        </Card>
      </div>

      {/* 사용자 상세보기 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setDetailUser(null)
        }}
        title="사용자 상세 정보"
      >
        {detailUser && (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                기본 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">ID:</span>
                  <span className="text-sm font-medium text-gray-900">{detailUser.id}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">이름:</span>
                  <span className="text-sm font-medium text-gray-900">{detailUser.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">이메일:</span>
                  <span className="text-sm font-medium text-gray-900">{detailUser.email}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">역할:</span>
                  <div>{getRoleBadge(detailUser.role)}</div>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">상태:</span>
                  <div>{getStatusBadge(detailUser.status)}</div>
                </div>
              </div>
            </div>

            {/* 인증 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                인증 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">이메일 인증:</span>
                  {detailUser.emailVerified ? (
                    <span className="inline-flex items-center text-sm text-success-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      인증됨
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      미인증
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 활동 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                활동 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">가입일:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDateTime(detailUser.createdAt)}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">마지막 로그인:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {detailUser.lastLoginAt ? formatDateTime(detailUser.lastLoginAt) : '로그인 기록 없음'}
                  </span>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setDetailUser(null)
                }}
              >
                닫기
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 사용자 상태 변경 모달 */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedUser(null)
          setNewStatus('suspended')
          setStatusReason('')
        }}
        title="사용자 상태 변경"
      >
        <div className="space-y-4">
          {selectedUser && (
            <>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    사용자: <span className="font-semibold text-gray-900">{selectedUser.name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    이메일: <span className="font-semibold text-gray-900">{selectedUser.email}</span>
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">현재 상태:</span>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  변경할 상태 <span className="text-error-500">*</span>
                </label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
                >
                  <option value="active">활성 (active)</option>
                  <option value="inactive">비활성 (inactive)</option>
                  <option value="suspended">정지 (suspended)</option>
                </Select>
              </div>

              {newStatus === 'suspended' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-yellow-800">
                      정지된 사용자는 로그인할 수 없습니다
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사유 {newStatus === 'suspended' && <span className="text-error-500">*</span>}
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={newStatus === 'suspended' ? '정지 사유를 입력하세요... (필수, 500자 이내)' : '변경 사유를 입력하세요... (선택, 500자 이내)'}
                />
                <p className="mt-1 text-xs text-gray-500">{statusReason.length}/500자</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsStatusModalOpen(false)
                    setSelectedUser(null)
                    setNewStatus('suspended')
                    setStatusReason('')
                  }}
                  disabled={isUpdating}
                >
                  취소
                </Button>
                <Button
                  variant={newStatus === 'suspended' ? 'error' : 'primary'}
                  onClick={handleConfirmStatusChange}
                  loading={isUpdating}
                >
                  상태 변경
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 사용자 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditUser(null)
          setEditName('')
          setEditEmail('')
          setEditRole('student')
        }}
        title="사용자 정보 수정"
      >
        <div className="space-y-4">
          {editUser && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">사용자 정보를 수정합니다</p>
                    <p className="text-xs text-blue-700">
                      현재 사용자: <span className="font-semibold">{editUser.name}</span> ({editUser.email})
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름 (2-50자)"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-gray-500">{editName.length}/50자</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할 <span className="text-error-500">*</span>
                </label>
                <Select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'student' | 'professor' | 'admin')}
                >
                  <option value="student">학생 (Student)</option>
                  <option value="professor">교수 (Professor)</option>
                  <option value="admin">관리자 (Admin)</option>
                </Select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditUser(null)
                    setEditName('')
                    setEditEmail('')
                    setEditRole('student')
                  }}
                  disabled={isEditing}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmEdit}
                  loading={isEditing}
                >
                  수정
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 사용자 삭제 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteUser(null)
          setDeletePassword('')
          setDeleteConfirmName('')
        }}
        title="사용자 삭제"
      >
        <div className="space-y-4">
          {deleteUser && (
            <>
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-error-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-error-800 mb-1">⚠️ 경고: 이 작업은 되돌릴 수 없습니다</p>
                    <p className="text-xs text-error-700">
                      사용자와 관련된 모든 데이터가 삭제됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    사용자: <span className="font-semibold text-gray-900">{deleteUser.name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    이메일: <span className="font-semibold text-gray-900">{deleteUser.email}</span>
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">역할:</span>
                    {getRoleBadge(deleteUser.role)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리자 비밀번호 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="현재 로그인한 관리자의 비밀번호"
                  autoComplete="off"
                  minLength={3}
                />
                <p className="mt-1 text-xs text-gray-500">보안을 위해 비밀번호를 입력해주세요 (3자 이상)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 이름 확인 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={`삭제하려면 "${deleteUser.name}" 입력`}
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-gray-500">
                  확인을 위해 <span className="font-semibold text-gray-700">{deleteUser.name}</span>을(를) 정확히 입력하세요
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeleteUser(null)
                    setDeletePassword('')
                    setDeleteConfirmName('')
                  }}
                  disabled={isDeleting}
                >
                  취소
                </Button>
                <Button
                  variant="error"
                  onClick={handleConfirmDelete}
                  loading={isDeleting}
                >
                  삭제
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 일괄 상태 변경 모달 */}
      <Modal
        isOpen={isBulkStatusModalOpen}
        onClose={() => {
          setIsBulkStatusModalOpen(false)
          setBulkStatus('active')
          setBulkStatusReason('')
        }}
        title="일괄 상태 변경"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  선택한 {selectedUserIds.length}명의 사용자 상태를 변경합니다
                </p>
                <p className="text-xs text-blue-700">
                  이 작업은 즉시 적용되며, 각 사용자에 대한 로그가 기록됩니다.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              변경할 상태 <span className="text-error-500">*</span>
            </label>
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
            >
              <option value="active">활성 (active)</option>
              <option value="inactive">비활성 (inactive)</option>
              <option value="suspended">정지 (suspended)</option>
            </Select>
          </div>

          {bulkStatus === 'suspended' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-yellow-800">
                  정지된 사용자는 로그인할 수 없습니다
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사유 {bulkStatus === 'suspended' && <span className="text-error-500">*</span>}
            </label>
            <textarea
              value={bulkStatusReason}
              onChange={(e) => setBulkStatusReason(e.target.value.slice(0, 500))}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={bulkStatus === 'suspended' ? '정지 사유를 입력하세요... (필수, 500자 이내)' : '변경 사유를 입력하세요... (선택, 500자 이내)'}
            />
            <p className="mt-1 text-xs text-gray-500">{bulkStatusReason.length}/500자</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setIsBulkStatusModalOpen(false)
                setBulkStatus('active')
                setBulkStatusReason('')
              }}
              disabled={isBulkStatusChanging}
            >
              취소
            </Button>
            <Button
              variant={bulkStatus === 'suspended' ? 'error' : 'primary'}
              onClick={handleBulkStatusChange}
              loading={isBulkStatusChanging}
            >
              {selectedUserIds.length}명 상태 변경
            </Button>
          </div>
        </div>
      </Modal>

      {/* 일괄 삭제 모달 */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          setIsBulkDeleteModalOpen(false)
          setBulkDeletePassword('')
        }}
        title="일괄 사용자 삭제"
      >
        <div className="space-y-4">
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-error-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-error-800 mb-1">
                  ⚠️ 경고: 이 작업은 되돌릴 수 없습니다
                </p>
                <p className="text-xs text-error-700">
                  선택한 {selectedUserIds.length}명의 사용자와 관련된 모든 데이터가 삭제됩니다.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 비밀번호 <span className="text-error-500">*</span>
            </label>
            <Input
              type="password"
              value={bulkDeletePassword}
              onChange={(e) => setBulkDeletePassword(e.target.value)}
              placeholder="현재 로그인한 관리자의 비밀번호"
              autoComplete="off"
              minLength={3}
            />
            <p className="mt-1 text-xs text-gray-500">보안을 위해 비밀번호를 입력해주세요 (3자 이상)</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setIsBulkDeleteModalOpen(false)
                setBulkDeletePassword('')
              }}
              disabled={isBulkDeleting}
            >
              취소
            </Button>
            <Button
              variant="error"
              onClick={handleBulkDelete}
              loading={isBulkDeleting}
            >
              {selectedUserIds.length}명 삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 사용자 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setCreateEmail('')
          setCreateName('')
          setCreatePassword('')
          setCreateRole('student')
          setCreateErrors({})
        }}
        title="사용자 생성"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-error-500">*</span>
            </label>
            <Input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value.slice(0, 50))}
              placeholder="사용자의 이름을 입력하세요"
              maxLength={50}
              error={createErrors.createName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-error-500">*</span>
            </label>
            <Input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="사용자의 이메일을 입력하세요"
              error={createErrors.createEmail}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span className="text-error-500">*</span>
            </label>
            <Input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="6자 이상의 비밀번호를 입력하세요"
              autoComplete="new-password"
              error={createErrors.createPassword}
            />
            <p className="mt-1 text-xs text-gray-500">
              비밀번호는 6자 이상 50자 이내여야 합니다
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              역할 <span className="text-error-500">*</span>
            </label>
            <Select value={createRole} onChange={(e) => setCreateRole(e.target.value as 'student' | 'professor')}>
              <option value="student">학생</option>
              <option value="professor">교수</option>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              관리자는 이 화면에서 생성할 수 없습니다
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false)
                setCreateEmail('')
                setCreateName('')
                setCreatePassword('')
                setCreateRole('student')
                setCreateErrors({})
              }}
              disabled={isCreating}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              loading={isCreating}
            >
              생성
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default UserManagementPage
