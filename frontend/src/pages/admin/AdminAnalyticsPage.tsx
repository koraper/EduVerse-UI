import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'

// 날짜 범위 타입
type DateRange = '7d' | '30d' | '90d' | 'all'

// 사용자 증가 데이터 인터페이스
interface UserGrowthData {
  date: string
  newUsers: number
  totalUsers: number
}

// 역할별 분포 데이터
interface RoleDistribution {
  role: string
  count: number
  percentage: number
  color: string
}

// 수업 통계 데이터
interface ClassStatsData {
  totalClasses: number
  activeClasses: number
  prepClasses: number
  archivedClasses: number
  averageStudents: number
  totalEnrollments: number
}

// 학습 통계 데이터
interface LearningStatsData {
  totalLearningHours: number
  averageLearningTime: number
  averageCompletionRate: number
  averageScore: number
  totalSubmissions: number
  totalQuestions: number
}

// 주간 활동 데이터
interface WeeklyActivity {
  day: string
  students: number
  professors: number
}

const AdminAnalyticsPage = () => {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [isLoading, setIsLoading] = useState(true)

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

    // Mock 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }, [user, authLoading, navigate])

  // Mock 데이터: 사용자 증가 추이 (최근 30일)
  const userGrowthData: UserGrowthData[] = [
    { date: '9/20', newUsers: 12, totalUsers: 150 },
    { date: '9/23', newUsers: 8, totalUsers: 158 },
    { date: '9/26', newUsers: 15, totalUsers: 173 },
    { date: '9/29', newUsers: 10, totalUsers: 183 },
    { date: '10/02', newUsers: 18, totalUsers: 201 },
    { date: '10/05', newUsers: 14, totalUsers: 215 },
    { date: '10/08', newUsers: 20, totalUsers: 235 },
    { date: '10/11', newUsers: 16, totalUsers: 251 },
    { date: '10/14', newUsers: 22, totalUsers: 273 },
    { date: '10/17', newUsers: 19, totalUsers: 292 },
  ]

  // Mock 데이터: 역할별 분포
  const roleDistribution: RoleDistribution[] = [
    { role: '학생', count: 248, percentage: 85, color: 'bg-blue-500' },
    { role: '교수', count: 38, percentage: 13, color: 'bg-green-500' },
    { role: '관리자', count: 6, percentage: 2, color: 'bg-purple-500' },
  ]

  // Mock 데이터: 수업 통계
  const classStats: ClassStatsData = {
    totalClasses: 45,
    activeClasses: 38,
    prepClasses: 5,
    archivedClasses: 2,
    averageStudents: 32,
    totalEnrollments: 1440,
  }

  // Mock 데이터: 학습 통계
  const learningStats: LearningStatsData = {
    totalLearningHours: 12450,
    averageLearningTime: 42.5,
    averageCompletionRate: 78,
    averageScore: 82,
    totalSubmissions: 3825,
    totalQuestions: 1250,
  }

  // Mock 데이터: 주간 활동
  const weeklyActivity: WeeklyActivity[] = [
    { day: '월', students: 180, professors: 28 },
    { day: '화', students: 220, professors: 32 },
    { day: '수', students: 195, professors: 30 },
    { day: '목', students: 210, professors: 35 },
    { day: '금', students: 175, professors: 25 },
    { day: '토', students: 85, professors: 10 },
    { day: '일', students: 60, professors: 8 },
  ]

  // 날짜 범위 레이블
  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case '7d':
        return '최근 7일'
      case '30d':
        return '최근 30일'
      case '90d':
        return '최근 90일'
      case 'all':
        return '전체'
      default:
        return '최근 30일'
    }
  }

  // 간단한 막대 차트 컴포넌트
  const SimpleBarChart = ({ data }: { data: UserGrowthData[] }) => {
    const maxValue = Math.max(...data.map((d) => d.totalUsers))

    return (
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className={`text-xs font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.newUsers}</div>
            <div className={`w-full rounded-t transition-colors relative group cursor-pointer ${currentTheme === 'dark' ? 'bg-primary-500 hover:bg-primary-400' : 'bg-primary-500 hover:bg-primary-600'}`} style={{ height: `${(item.totalUsers / maxValue) * 100}%`, minHeight: '20px' }}>
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'}`}>
                총 {item.totalUsers}명
              </div>
            </div>
            <div className={`text-xs mt-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.date}</div>
          </div>
        ))}
      </div>
    )
  }

  // 주간 활동 차트
  const WeeklyActivityChart = ({ data }: { data: WeeklyActivity[] }) => {
    const maxValue = Math.max(...data.map((d) => Math.max(d.students, d.professors)))

    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-8 text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item.day}</div>
            <div className="flex-1 flex gap-2">
              <div className={`flex-1 rounded-full h-8 relative overflow-hidden ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(item.students / maxValue) * 100}%` }}>
                  <span className="text-xs text-white font-medium">{item.students}</span>
                </div>
              </div>
              <div className={`flex-1 rounded-full h-8 relative overflow-hidden ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(item.professors / maxValue) * 100}%` }}>
                  <span className="text-xs text-white font-medium">{item.professors}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>학생</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>교수</span>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className={`h-8 rounded w-48 animate-pulse ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <div className="p-6 space-y-3">
                  <div className={`h-4 rounded w-24 animate-pulse ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-8 rounded w-16 animate-pulse ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>통계 & 분석</h1>
            <p className={`mt-1 text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>시스템 통계와 사용자 활동 데이터를 분석하세요</p>
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>기간:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)} className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${currentTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
              <option value="all">전체</option>
            </select>
          </div>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>전체 사용자</p>
                  <p className={`text-3xl font-bold mt-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{roleDistribution.reduce((sum, r) => sum + r.count, 0)}</p>
                  <p className={`text-xs mt-2 ${currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>↑ 지난주 대비 +12명</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>진행 중인 수업</p>
                  <p className={`text-3xl font-bold mt-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{classStats.activeClasses}</p>
                  <p className={`text-xs mt-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>전체 {classStats.totalClasses}개</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>평균 학습 시간</p>
                  <p className={`text-3xl font-bold mt-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{learningStats.averageLearningTime}h</p>
                  <p className={`text-xs mt-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>사용자당 평균</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentTheme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>평균 점수</p>
                  <p className={`text-3xl font-bold mt-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{learningStats.averageScore}점</p>
                  <p className={`text-xs mt-2 ${currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>완료율 {learningStats.averageCompletionRate}%</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentTheme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                  <svg className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 사용자 증가 추이 */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사용자 증가 추이</h3>
                <Badge variant="blue">{getDateRangeLabel(dateRange)}</Badge>
              </div>
              <SimpleBarChart data={userGrowthData} />
              <div className={`mt-4 pt-4 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>신규 가입자</span>
                  <span className={`font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userGrowthData.reduce((sum, d) => sum + d.newUsers, 0)}명</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 역할별 분포 */}
          <Card>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-6 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>역할별 분포</h3>
              <div className="space-y-4">
                {roleDistribution.map((role, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{role.role}</span>
                      <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {role.count}명 ({role.percentage}%)
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 overflow-hidden ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`${role.color} h-full rounded-full transition-all duration-500`} style={{ width: `${role.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-6 pt-4 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  전체 <span className={`font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{roleDistribution.reduce((sum, r) => sum + r.count, 0)}명</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 주간 활동 & 수업 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 주간 활동 */}
          <Card>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-6 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>주간 활동 현황</h3>
              <WeeklyActivityChart data={weeklyActivity} />
            </div>
          </Card>

          {/* 수업 통계 상세 */}
          <Card>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-6 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>수업 통계</h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>활성 수업</span>
                  </div>
                  <span className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{classStats.activeClasses}</span>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>준비 중</span>
                  </div>
                  <span className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{classStats.prepClasses}</span>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>보관됨</span>
                  </div>
                  <span className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{classStats.archivedClasses}</span>
                </div>

                <div className={`pt-4 mt-4 border-t space-y-2 ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between text-sm">
                    <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>평균 수강생 수</span>
                    <span className={`font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{classStats.averageStudents}명</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>총 수강 신청</span>
                    <span className={`font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{classStats.totalEnrollments}건</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 학습 분석 */}
        <Card>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-6 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>학습 분석</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`text-center p-6 rounded-lg ${currentTheme === 'dark' ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                <div className={`text-4xl font-bold ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{learningStats.totalLearningHours.toLocaleString()}</div>
                <div className={`text-sm mt-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 학습 시간 (시간)</div>
                <div className={`text-xs mt-1 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>전체 사용자 누적</div>
              </div>

              <div className={`text-center p-6 rounded-lg ${currentTheme === 'dark' ? 'bg-gradient-to-br from-green-900/40 to-green-800/40' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                <div className={`text-4xl font-bold ${currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{learningStats.totalSubmissions.toLocaleString()}</div>
                <div className={`text-sm mt-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 과제 제출</div>
                <div className={`text-xs mt-1 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>평균 제출률 {learningStats.averageCompletionRate}%</div>
              </div>

              <div className={`text-center p-6 rounded-lg ${currentTheme === 'dark' ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
                <div className={`text-4xl font-bold ${currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{learningStats.totalQuestions.toLocaleString()}</div>
                <div className={`text-sm mt-2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>총 질문 수</div>
                <div className={`text-xs mt-1 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>활발한 질의응답</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 안내 메시지 */}
        <Card>
          <div className={`p-6 border rounded-lg ${currentTheme === 'dark' ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className={`w-5 h-5 mt-0.5 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold mb-1 ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>Mock 데이터 사용 중</h4>
                <p className={`text-sm ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                  현재 표시된 통계는 개발용 Mock 데이터입니다. 실제 API 연동 후 실시간 데이터가 표시됩니다. 추가 예정 기능: 고급 차트 라이브러리 (Chart.js/Recharts), 날짜 범위별 필터링, CSV/Excel 내보내기 등
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminAnalyticsPage
