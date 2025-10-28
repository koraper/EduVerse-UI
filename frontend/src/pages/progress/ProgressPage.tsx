import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/layout/StudentLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'

const ProgressPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 학생만 접근 가능
    if (user && user.role !== 'student') {
      navigate('/dashboard')
      return
    }

    // 비인증 사용자 리다이렉트
    if (!user) {
      navigate('/login')
      return
    }

    // Mock 데이터 로드 (향후 API 호출로 변경)
    setIsLoading(false)
  }, [user, navigate])

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-primary-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Mock 학습 진도 데이터
  const courses = [
    {
      id: 1,
      name: '자료구조론',
      professor: '김교수',
      progress: 75,
      completedLectures: 15,
      totalLectures: 20,
      lastActivity: '2025-10-17 14:30',
    },
    {
      id: 2,
      name: '알고리즘',
      professor: '이교수',
      progress: 60,
      completedLectures: 12,
      totalLectures: 20,
      lastActivity: '2025-10-16 10:15',
    },
    {
      id: 3,
      name: '데이터베이스',
      professor: '박교수',
      progress: 85,
      completedLectures: 17,
      totalLectures: 20,
      lastActivity: '2025-10-17 16:45',
    },
    {
      id: 4,
      name: '운영체제',
      professor: '최교수',
      progress: 45,
      completedLectures: 9,
      totalLectures: 20,
      lastActivity: '2025-10-15 09:00',
    },
  ]

  // 전체 통계
  const totalCourses = courses.length
  const totalProgress = Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
  const completedLectures = courses.reduce((sum, c) => sum + c.completedLectures, 0)
  const totalLectures = courses.reduce((sum, c) => sum + c.totalLectures, 0)

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success'
    if (progress >= 60) return 'warning'
    return 'gray'
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">학습 진도</h1>
          <p className="mt-1 text-sm text-gray-600">각 과목별 학습 현황을 확인하고 학습 계획을 세우세요</p>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">수강 중인 과목</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totalCourses}</p>
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
                  <p className="text-sm font-medium text-gray-600">평균 진행률</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{totalProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">수강한 강의</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{completedLectures}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">전체 {totalLectures}강 중</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">학습 효율성</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">89%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 과목별 진도 상세 */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">과목별 학습 진도</h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{course.name}</p>
                        <Badge variant={getProgressColor(course.progress)}>
                          {course.progress}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{course.professor} 교수</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{course.completedLectures}/{course.totalLectures}</p>
                      <p className="text-xs text-gray-500">강의 수강</p>
                    </div>
                  </div>

                  {/* 진행바 */}
                  <div className="mb-3">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 최근 활동 */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      마지막 활동: {course.lastActivity}
                    </div>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      상세 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 학습 권장사항 */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">학습 권장사항</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">운영체제 과목 진도 가속화 권장</p>
                  <p className="text-xs text-gray-500 mt-1">현재 45% 진행률로 다른 과목에 비해 뒤쳐지고 있습니다. 이번 주에 최소 3강 이상 수강을 권장합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">데이터베이스 과목 순조로운 진행</p>
                  <p className="text-xs text-gray-500 mt-1">85%의 진행률로 잘 따라가고 있습니다. 현재 속도를 유지하면 다음 주 말 완료 가능합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">균형잡힌 학습 계획 유지</p>
                  <p className="text-xs text-gray-500 mt-1">전체 평균 진행률 66%로 좋은 진행 속도를 유지하고 있습니다. 계속 화이팅!</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  )
}

export default ProgressPage
