import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Select from '@/components/common/Select'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { timeAgo } from '@/utils/timeAgo'
import { exportToCSV, exportToXLSX, getFilenameWithDate } from '@/utils/export'

interface AdminLog {
  id: number
  action: string
  adminName: string
  targetName: string
  targetType: 'user' | 'class' | 'curriculum' | 'system'
  timestamp: string
  details?: string
}

type ActionFilter = 'all' | 'create' | 'update' | 'delete' | 'suspend' | 'activate' | 'other'
type DateRangeFilter = '7d' | '30d' | '90d' | 'all'

// Mock 로그 데이터 (실제로는 API에서 가져옴)
const MOCK_LOGS: AdminLog[] = [
  {
    id: 1,
    action: '사용자 정지',
    adminName: '관리자',
    targetName: '김학생',
    targetType: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    details: '부적절한 행동으로 인한 정지'
  },
  {
    id: 2,
    action: '사용자 생성',
    adminName: '관리자',
    targetName: '이학생',
    targetType: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    action: '수업 생성',
    adminName: '관리자',
    targetName: '자료구조론',
    targetType: 'class',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 4,
    action: '사용자 활성화',
    adminName: '관리자',
    targetName: '박학생',
    targetType: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 5,
    action: '수업 수정',
    adminName: '관리자',
    targetName: '알고리즘',
    targetType: 'class',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    details: '수업 설명 업데이트'
  },
  {
    id: 6,
    action: '커리큘럼 생성',
    adminName: '관리자',
    targetName: 'Python 기초',
    targetType: 'curriculum',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 7,
    action: '시스템 설정 변경',
    adminName: '관리자',
    targetName: '이메일 설정',
    targetType: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 8,
    action: '사용자 삭제',
    adminName: '관리자',
    targetName: '최학생',
    targetType: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    details: '계정 삭제 요청'
  },
  {
    id: 9,
    action: '수업 삭제',
    adminName: '관리자',
    targetName: '운영체제',
    targetType: 'class',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const AdminLogsPage = () => {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  // 필터 상태
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('30d')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const LOGS_PER_PAGE = 20

  // 대량 작업 상태
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [logs, setLogs] = useState<AdminLog[]>([]) // Mock 데이터를 상태로 관리

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

    // Mock 데이터 초기화
    setLogs(MOCK_LOGS)
  }, [user, authLoading, navigate])

  const getActionType = (action: string): ActionFilter => {
    if (action.includes('정지')) return 'suspend'
    if (action.includes('활성화')) return 'activate'
    if (action.includes('생성')) return 'create'
    if (action.includes('수정') || action.includes('변경')) return 'update'
    if (action.includes('삭제')) return 'delete'
    return 'other'
  }

  const getActionBadge = (action: string) => {
    const type = getActionType(action)
    switch (type) {
      case 'create':
        return <Badge variant="blue" size="sm">생성</Badge>
      case 'update':
        return <Badge variant="warning" size="sm">수정</Badge>
      case 'delete':
        return <Badge variant="error" size="sm">삭제</Badge>
      case 'suspend':
        return <Badge variant="error" size="sm">정지</Badge>
      case 'activate':
        return <Badge variant="success" size="sm">활성화</Badge>
      default:
        return <Badge variant="gray" size="sm">기타</Badge>
    }
  }

  const getTargetTypeBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="purple" size="sm">사용자</Badge>
      case 'class':
        return <Badge variant="blue" size="sm">수업</Badge>
      case 'curriculum':
        return <Badge variant="success" size="sm">커리큘럼</Badge>
      case 'system':
        return <Badge variant="gray" size="sm">시스템</Badge>
      default:
        return <Badge variant="gray" size="sm">기타</Badge>
    }
  }

  // 날짜 범위 필터링 함수
  const isWithinDateRange = (timestamp: string, range: DateRangeFilter): boolean => {
    if (range === 'all') return true

    const logDate = new Date(timestamp)
    const now = new Date()

    const daysAgo = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    }[range]

    if (!daysAgo) return true

    const rangeStart = new Date(now)
    rangeStart.setDate(now.getDate() - daysAgo)

    return logDate >= rangeStart
  }

  // 필터링된 로그
  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || getActionType(log.action) === actionFilter
    const matchesDateRange = isWithinDateRange(log.timestamp, dateRangeFilter)
    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAction && matchesDateRange && matchesSearch
  })

  // 페이지네이션된 로그
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  )

  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE)

  // 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [actionFilter, dateRangeFilter, searchQuery])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 내보내기 함수
  const handleExportCSV = async () => {
    if (filteredLogs.length === 0) {
      addToast('내보낼 데이터가 없습니다', { variant: 'warning' })
      return
    }

    setIsExporting(true)
    try {
      // 내보낼 데이터 포맷팅
      const exportData = filteredLogs.map((log) => ({
        시간: formatDateTime(log.timestamp),
        액션: log.action,
        관리자: log.adminName,
        대상: log.targetName,
        유형: log.targetType === 'user' ? '사용자' : log.targetType === 'class' ? '수업' : log.targetType === 'curriculum' ? '커리큘럼' : '시스템',
        상세: log.details || '',
      }))

      const filename = getFilenameWithDate('관리자로그', 'csv')
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
    if (filteredLogs.length === 0) {
      addToast('내보낼 데이터가 없습니다', { variant: 'warning' })
      return
    }

    setIsExporting(true)
    try {
      // 내보낼 데이터 포맷팅
      const exportData = filteredLogs.map((log) => ({
        시간: formatDateTime(log.timestamp),
        액션: log.action,
        관리자: log.adminName,
        대상: log.targetName,
        유형: log.targetType === 'user' ? '사용자' : log.targetType === 'class' ? '수업' : log.targetType === 'curriculum' ? '커리큘럼' : '시스템',
        상세: log.details || '',
      }))

      const filename = getFilenameWithDate('관리자로그', 'xlsx')
      exportToXLSX(exportData, { filename, sheetName: '로그' })
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
    if (selectedLogIds.length === paginatedLogs.length) {
      setSelectedLogIds([])
    } else {
      setSelectedLogIds(paginatedLogs.map(log => log.id))
    }
  }

  // 개별 선택/해제
  const handleSelectLog = (logId: number) => {
    if (selectedLogIds.includes(logId)) {
      setSelectedLogIds(selectedLogIds.filter(id => id !== logId))
    } else {
      setSelectedLogIds([...selectedLogIds, logId])
    }
  }

  // 일괄 삭제 (Mock 데이터이므로 상태에서 제거)
  const handleBulkDelete = () => {
    if (selectedLogIds.length === 0) {
      addToast('선택된 로그가 없습니다', { variant: 'warning' })
      return
    }

    setIsBulkDeleting(true)
    try {
      // Mock 데이터에서 선택된 로그 제거
      const updatedLogs = logs.filter(log => !selectedLogIds.includes(log.id))
      setLogs(updatedLogs)

      addToast(`${selectedLogIds.length}개의 로그가 삭제되었습니다`, { variant: 'success' })
      setIsBulkDeleteModalOpen(false)
      setSelectedLogIds([])
    } catch (error) {
      console.error('로그 삭제 실패:', error)
      addToast('로그 삭제에 실패했습니다', { variant: 'error' })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // 선택된 로그만 내보내기
  const handleExportSelected = (format: 'csv' | 'xlsx') => {
    if (selectedLogIds.length === 0) {
      addToast('선택된 로그가 없습니다', { variant: 'warning' })
      return
    }

    const selectedLogs = logs.filter(log => selectedLogIds.includes(log.id))

    setIsExporting(true)
    try {
      const exportData = selectedLogs.map((log) => ({
        시간: formatDateTime(log.timestamp),
        액션: log.action,
        관리자: log.adminName,
        대상: log.targetName,
        유형: log.targetType === 'user' ? '사용자' : log.targetType === 'class' ? '수업' : log.targetType === 'curriculum' ? '커리큘럼' : '시스템',
        상세: log.details || '',
      }))

      if (format === 'csv') {
        const filename = getFilenameWithDate('선택된로그', 'csv')
        exportToCSV(exportData, { filename })
        addToast('CSV 파일이 다운로드되었습니다', { variant: 'success' })
      } else {
        const filename = getFilenameWithDate('선택된로그', 'xlsx')
        exportToXLSX(exportData, { filename, sheetName: '로그' })
        addToast('XLSX 파일이 다운로드되었습니다', { variant: 'success' })
      }
    } catch (error) {
      console.error('내보내기 실패:', error)
      addToast('내보내기에 실패했습니다', { variant: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">로그 관리</h1>
          <p className="mt-1 text-sm text-gray-600">모든 관리자 활동을 감시하고 기록을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <div className="text-sm font-medium text-gray-600">전체 로그</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">{logs.length}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm font-medium text-gray-600">오늘</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {logs.filter(log => {
                  const logDate = new Date(log.timestamp)
                  const today = new Date()
                  return logDate.toDateString() === today.toDateString()
                }).length}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm font-medium text-gray-600">이번 주</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {logs.filter(log => {
                  const logDate = new Date(log.timestamp)
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return logDate >= weekAgo
                }).length}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm font-medium text-gray-600">관리자</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">1</div>
            </div>
          </Card>
        </div>

        {/* 필터 */}
        <Card>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="로그 검색 (액션, 관리자, 대상)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                >
                  <option value="all">모든 액션</option>
                  <option value="create">생성</option>
                  <option value="update">수정</option>
                  <option value="delete">삭제</option>
                  <option value="suspend">정지</option>
                  <option value="activate">활성화</option>
                  <option value="other">기타</option>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
                >
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                  <option value="90d">최근 90일</option>
                  <option value="all">전체 기간</option>
                </Select>
              </div>
            </div>

            {/* 활성 필터 표시 */}
            {(actionFilter !== 'all' || dateRangeFilter !== '30d' || searchQuery) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">활성 필터:</span>
                {actionFilter !== 'all' && (
                  <Badge
                    variant="gray"
                    size="sm"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => setActionFilter('all')}
                  >
                    액션: {actionFilter === 'create' ? '생성' :
                           actionFilter === 'update' ? '수정' :
                           actionFilter === 'delete' ? '삭제' :
                           actionFilter === 'suspend' ? '정지' :
                           actionFilter === 'activate' ? '활성화' : '기타'} ✕
                  </Badge>
                )}
                {dateRangeFilter !== '30d' && (
                  <Badge
                    variant="gray"
                    size="sm"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => setDateRangeFilter('30d')}
                  >
                    기간: {dateRangeFilter === '7d' ? '최근 7일' :
                           dateRangeFilter === '90d' ? '최근 90일' : '전체 기간'} ✕
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    variant="gray"
                    size="sm"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => setSearchQuery('')}
                  >
                    검색: {searchQuery} ✕
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setActionFilter('all')
                    setDateRangeFilter('30d')
                    setSearchQuery('')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  모두 초기화
                </button>
              </div>
            )}

            {/* 내보내기 & 대량 작업 버튼 */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              {/* 내보내기 버튼 */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isExporting || filteredLogs.length === 0}
                >
                  CSV 내보내기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportXLSX}
                  disabled={isExporting || filteredLogs.length === 0}
                >
                  XLSX 내보내기
                </Button>
              </div>

              {/* 대량 작업 패널 */}
              {selectedLogIds.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedLogIds.length}개 선택됨
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportSelected('csv')}
                      disabled={isExporting}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportSelected('xlsx')}
                      disabled={isExporting}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      XLSX
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLogIds([])}
                    >
                      선택 해제
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 로그 테이블 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedLogIds.length > 0 && selectedLogIds.length === paginatedLogs.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    액션
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    관리자
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    대상
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    유형
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery || actionFilter !== 'all' || dateRangeFilter !== '30d'
                        ? '검색 결과가 없습니다'
                        : '로그가 없습니다'}
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLogIds.includes(log.id)}
                          onChange={() => handleSelectLog(log.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <div>{formatDateTime(log.timestamp)}</div>
                        <div className="text-xs text-gray-400">{timeAgo(log.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {log.adminName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {log.targetName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getTargetTypeBadge(log.targetType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate text-center">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{filteredLogs.length}</span>개 중{' '}
                  <span className="font-medium">{(currentPage - 1) * LOGS_PER_PAGE + 1}</span>-
                  <span className="font-medium">
                    {Math.min(currentPage * LOGS_PER_PAGE, filteredLogs.length)}
                  </span>
                  개 표시
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    이전
                  </button>
                  <span className="text-sm text-gray-700">
                    페이지 <span className="font-medium">{currentPage}</span> /{' '}
                    <span className="font-medium">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 일괄 삭제 모달 */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="일괄 로그 삭제"
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
                  선택한 {selectedLogIds.length}개의 로그 기록이 영구적으로 삭제됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  로그 삭제 정보
                </p>
                <p className="text-xs text-blue-700">
                  삭제하기 전에 중요한 로그는 먼저 내보내기(CSV/XLSX)를 해두세요.
                  감사(Audit) 목적으로 로그를 보관해야 할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
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
              {selectedLogIds.length}개 삭제
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default AdminLogsPage
