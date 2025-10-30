import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Select from '@/components/common/Select'
import Loading from '@/components/common/Loading'
import { DashboardSkeleton } from '@/components/common/Skeleton'
import { timeAgo } from '@/utils/timeAgo'
import { withRetry, apiRetryStrategy } from '@/utils/retry'
import { errorLogger } from '@/services/errorLogger'

interface Stats {
  totalUsers: number
  totalStudents: number
  totalProfessors: number
  totalClasses: number
  activeClasses: number
  totalEnrollments: number
}

interface RecentActivity {
  id: number
  action: string
  adminName: string
  targetName: string
  timestamp: string
}

type ActionFilter = 'all' | 'suspend' | 'activate' | 'create' | 'update' | 'delete' | 'other'
type DateRangeFilter = '7d' | '30d' | '90d' | 'all'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user, token, isLoading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const { handleResponseError, handleError } = useApiError({
    onAuthError: () => navigate('/login'),
    onPermissionError: () => navigate('/admin/dashboard'),
  })
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 활동 필터링, 검색 및 페이지네이션
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('30d')
  const [searchQuery, setSearchQuery] = useState('')
  const [activityPage, setActivityPage] = useState(1)
  const ACTIVITIES_PER_PAGE = 5

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

    // 토큰이 없으면 대기
    if (!token) {
      return
    }

    fetchAdminData()
  }, [user, token, authLoading, navigate])

  const fetchAdminData = async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      // 재시도 로직과 함께 API 호출
      const [statsRes, activityRes] = await Promise.all([
        withRetry(
          () =>
            fetch('/api/admin/stats', {
              headers: { 'Authorization': `Bearer ${token}` },
            }),
          {
            ...apiRetryStrategy.query,
            onRetry: (attempt, error) => {
              errorLogger.warn(`통계 데이터 조회 재시도 (${attempt}회)`, error, {
                endpoint: '/api/admin/stats',
              })
            },
          }
        ),
        withRetry(
          () =>
            fetch('/api/admin/recent-activity', {
              headers: { 'Authorization': `Bearer ${token}` },
            }),
          {
            ...apiRetryStrategy.query,
            onRetry: (attempt, error) => {
              errorLogger.warn(`최근 활동 조회 재시도 (${attempt}회)`, error, {
                endpoint: '/api/admin/recent-activity',
              })
            },
          }
        ),
      ])

      // 응답 상태 코드 검증
      if (!statsRes.ok) {
        await handleResponseError(statsRes)
        setHasError(true)
        errorLogger.error('통계 데이터 조회 실패', statsRes, {
          status: statsRes.status,
        })
        return
      }

      if (!activityRes.ok) {
        await handleResponseError(activityRes)
        setHasError(true)
        errorLogger.error('최근 활동 조회 실패', activityRes, {
          status: activityRes.status,
        })
        return
      }

      const statsData = await statsRes.json()
      const activityData = await activityRes.json()

      if (statsData.status === 'success') {
        setStats(statsData.data)
      } else {
        throw new Error(statsData.message || '통계 데이터 조회에 실패했습니다')
      }

      if (activityData.status === 'success') {
        setRecentActivity(activityData.data.activities)
      } else {
        throw new Error(activityData.message || '최근 활동 조회에 실패했습니다')
      }

      errorLogger.info('관리자 대시보드 데이터 로드 완료')
    } catch (error) {
      handleError(error)
      errorLogger.error('관리자 대시보드 데이터 로드 실패', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    if (action.includes('정지')) return <Badge variant="error" size="sm">정지</Badge>
    if (action.includes('활성화')) return <Badge variant="success" size="sm">활성화</Badge>
    if (action.includes('생성')) return <Badge variant="blue" size="sm">생성</Badge>
    if (action.includes('수정') || action.includes('변경')) return <Badge variant="warning" size="sm">수정</Badge>
    if (action.includes('삭제')) return <Badge variant="error" size="sm">삭제</Badge>
    return <Badge variant="gray" size="sm">기타</Badge>
  }

  const getActionType = (action: string): ActionFilter => {
    if (action.includes('정지')) return 'suspend'
    if (action.includes('활성화')) return 'activate'
    if (action.includes('생성')) return 'create'
    if (action.includes('수정') || action.includes('변경')) return 'update'
    if (action.includes('삭제')) return 'delete'
    return 'other'
  }

  // 날짜 범위 필터링 헬퍼 함수
  const isWithinDateRange = (timestamp: string, range: DateRangeFilter): boolean => {
    if (range === 'all') return true

    const activityDate = new Date(timestamp)
    const now = new Date()
    const daysAgo = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    }[range]

    if (!daysAgo) return true

    const rangeStart = new Date(now)
    rangeStart.setDate(now.getDate() - daysAgo)

    return activityDate >= rangeStart
  }

  // 필터링된 활동 목록 (액션 타입 + 날짜 범위 + 검색)
  const filteredActivities = recentActivity.filter((activity) => {
    // 액션 타입 필터
    const matchesAction = actionFilter === 'all' || getActionType(activity.action) === actionFilter

    // 날짜 범위 필터
    const matchesDateRange = isWithinDateRange(activity.timestamp, dateRangeFilter)

    // 검색 필터 (관리자명 또는 대상명)
    const matchesSearch = searchQuery === '' ||
      activity.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesAction && matchesDateRange && matchesSearch
  })

  // 페이지네이션된 활동 목록
  const paginatedActivities = filteredActivities.slice(
    (activityPage - 1) * ACTIVITIES_PER_PAGE,
    activityPage * ACTIVITIES_PER_PAGE
  )

  const totalActivityPages = Math.ceil(filteredActivities.length / ACTIVITIES_PER_PAGE)

  // 필터 또는 검색 변경 시 첫 페이지로 이동
  useEffect(() => {
    setActivityPage(1)
  }, [actionFilter, dateRangeFilter, searchQuery])

  // 스켈레톤 UI 렌더링 (인증 로딩 중 또는 데이터 로딩 중)
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  // 에러 상태 UI
  if (hasError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>관리자 대시보드</h1>
            <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>시스템 전체 현황을 확인하세요</p>
          </div>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <svg className={`h-5 w-5 ${currentTheme === 'dark' ? 'text-error-400' : 'text-error-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-medium ${currentTheme === 'dark' ? 'text-error-300' : 'text-error-900'}`}>데이터 로드 실패</h3>
                  </div>
                  <p className={`text-sm mb-4 ${currentTheme === 'dark' ? 'text-error-400' : 'text-error-700'}`}>
                    관리자 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAdminData}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'bg-primary-600 hover:bg-primary-500'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 5.414 1 1 0 11-1.414-1.414A5.002 5.002 0 004.059 6.101H7a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                다시 시도
              </button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>관리자 대시보드</h1>
          <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>시스템 전체 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>전체 사용자</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats?.totalUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>학생: {stats?.totalStudents || 0}명</span>
                <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>교수: {stats?.totalProfessors || 0}명</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>진행 중인 수업</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats?.activeClasses || 0}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  전체 수업: {stats?.totalClasses || 0}개
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 수강 신청</p>
                  <p className={`mt-2 text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats?.totalEnrollments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-xs font-medium ${currentTheme === 'dark' ? 'text-success-400' : 'text-success-600'}`}>
                  활성 등록만 집계
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card>
          <div className="p-6">
            <h2 className={`text-lg font-semibold mb-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>빠른 작업</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/admin/users')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className={`w-8 h-8 mb-2 ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사용자 관리</span>
              </button>

              <button
                onClick={() => navigate('/admin/classes')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className={`w-8 h-8 mb-2 ${currentTheme === 'dark' ? 'text-success-400' : 'text-success-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>수업 관리</span>
              </button>

              <button
                onClick={() => navigate('/admin/curricula')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className={`w-8 h-8 mb-2 ${currentTheme === 'dark' ? 'text-warning-400' : 'text-warning-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>커리큘럼 관리</span>
              </button>

              <button
                onClick={() => navigate('/admin/logs')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className={`w-8 h-8 mb-2 ${currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>로그 관리</span>
              </button>
            </div>
          </div>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>최근 관리 활동</h2>
              <button
                onClick={() => navigate('/admin/logs')}
                className={`text-sm font-medium ${
                  currentTheme === 'dark'
                    ? 'text-primary-400 hover:text-primary-300'
                    : 'text-primary-600 hover:text-primary-700'
                }`}
              >
                전체 보기 →
              </button>
            </div>

            {/* 필터 및 검색 */}
            <div className="space-y-3 mb-4">
              {/* 검색창 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="관리자명, 대상명 또는 액션 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className={`h-5 w-5 ${currentTheme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 필터 드롭다운 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                  className="w-full"
                >
                  <option value="all">모든 액션</option>
                  <option value="create">생성</option>
                  <option value="update">수정</option>
                  <option value="delete">삭제</option>
                  <option value="suspend">정지</option>
                  <option value="activate">활성화</option>
                  <option value="other">기타</option>
                </Select>

                <Select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
                  className="w-full"
                >
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                  <option value="90d">최근 90일</option>
                  <option value="all">전체 기간</option>
                </Select>
              </div>

              {/* 활성 필터 표시 */}
              {(actionFilter !== 'all' || dateRangeFilter !== '30d' || searchQuery !== '') && (
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>활성 필터:</span>
                  {actionFilter !== 'all' && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentTheme === 'dark'
                        ? 'bg-primary-900/30 text-primary-300'
                        : 'bg-primary-100 text-primary-800'
                    }`}>
                      액션: {actionFilter}
                      <button
                        onClick={() => setActionFilter('all')}
                        className={`ml-1 ${currentTheme === 'dark' ? 'hover:text-primary-200' : 'hover:text-primary-900'}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {dateRangeFilter !== '30d' && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentTheme === 'dark'
                        ? 'bg-blue-900/30 text-blue-300'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      기간: {dateRangeFilter === '7d' ? '최근 7일' : dateRangeFilter === '90d' ? '최근 90일' : '전체 기간'}
                      <button
                        onClick={() => setDateRangeFilter('30d')}
                        className={`ml-1 ${currentTheme === 'dark' ? 'hover:text-blue-200' : 'hover:text-blue-900'}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {searchQuery !== '' && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentTheme === 'dark'
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      검색: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`ml-1 ${currentTheme === 'dark' ? 'hover:text-green-200' : 'hover:text-green-900'}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setActionFilter('all')
                      setDateRangeFilter('30d')
                      setSearchQuery('')
                    }}
                    className={`text-xs underline ${currentTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    모두 지우기
                  </button>
                </div>
              )}
            </div>

            {recentActivity.length === 0 ? (
              <div className={`text-center py-8 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                최근 활동이 없습니다
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className={`text-center py-8 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                필터 조건에 맞는 활동이 없습니다
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        currentTheme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentTheme === 'dark'
                            ? 'bg-primary-900/30'
                            : 'bg-primary-100'
                        }`}>
                          <svg className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <span className="font-medium">{activity.adminName}</span>님이{' '}
                            <span className="font-medium">{activity.targetName}</span> 사용자를{' '}
                            <span className="font-medium">{activity.action}</span>
                          </p>
                          <p className={`text-xs mt-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{timeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                      {getActionBadge(activity.action)}
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalActivityPages > 1 && (
                  <div className={`flex items-center justify-between mt-4 pt-4 border-t ${
                    currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {filteredActivities.length}개 중 {((activityPage - 1) * ACTIVITIES_PER_PAGE) + 1}-
                      {Math.min(activityPage * ACTIVITIES_PER_PAGE, filteredActivities.length)}개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
                        disabled={activityPage === 1}
                        className={`px-3 py-1 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentTheme === 'dark'
                            ? 'text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        이전
                      </button>
                      <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {activityPage} / {totalActivityPages}
                      </span>
                      <button
                        onClick={() => setActivityPage((prev) => Math.min(totalActivityPages, prev + 1))}
                        disabled={activityPage === totalActivityPages}
                        className={`px-3 py-1 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentTheme === 'dark'
                            ? 'text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboardPage
