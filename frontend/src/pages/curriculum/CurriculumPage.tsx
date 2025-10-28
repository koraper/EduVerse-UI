import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'

const CurriculumPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // 교수만 접근 가능
    if (user && user.role !== 'professor') {
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
      <DashboardLayout>
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
      </DashboardLayout>
    )
  }

  // Mock 커리큘럼 데이터
  const curriculum = {
    name: '자료구조론',
    code: 'CS201',
    credits: 3,
    semester: '2025년 1학기',
    totalWeeks: 15,
    status: '진행 중',
  }

  const weeks = [
    {
      week: 1,
      title: '강의 소개 및 기본 개념',
      topics: ['커리큘럼 안내', '자료구조 개요', 'Big-O 분석'],
      assignments: 0,
      lectures: 2,
      status: '완료',
    },
    {
      week: 2,
      title: '배열과 링크드 리스트',
      topics: ['배열 구조', '동적 배열', '단일 링크드 리스트'],
      assignments: 1,
      lectures: 3,
      status: '완료',
    },
    {
      week: 3,
      title: '스택과 큐',
      topics: ['스택 구현', '큐 구현', '응용 사례'],
      assignments: 1,
      lectures: 3,
      status: '진행 중',
    },
    {
      week: 4,
      title: '트리 구조 (1)',
      topics: ['이진 트리', '트리 순회', '이진 탐색 트리'],
      assignments: 1,
      lectures: 3,
      status: '예정',
    },
    {
      week: 5,
      title: '트리 구조 (2)',
      topics: ['AVL 트리', '레드-블랙 트리', '힙'],
      assignments: 1,
      lectures: 3,
      status: '예정',
    },
  ]

  const learningOutcomes = [
    '자료구조의 기본 개념과 중요성 이해',
    '주요 자료구조의 구현과 응용 능력 습득',
    '효율적인 알고리즘 설계 능력 개발',
    '문제 해결을 위한 적절한 자료구조 선택 능력',
    '시간 복잡도 분석 및 최적화 능력',
  ]

  const assessmentMethods = [
    { method: '중간고사', weight: 25, date: '2025-10-25' },
    { method: '과제', weight: 25, date: '진행 중' },
    { method: '기말고사', weight: 30, date: '2025-12-20' },
    { method: '참여도 & 출석', weight: 20, date: '진행 중' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'success'
      case '진행 중':
        return 'warning'
      case '예정':
        return 'gray'
      default:
        return 'gray'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">커리큘럼 관리</h1>
          <p className="mt-1 text-sm text-gray-600">교과 과정을 계획하고 강의 일정을 관리하세요</p>
        </div>

        {/* 과목 정보 */}
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{curriculum.name}</h2>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>과목코드: {curriculum.code}</span>
                  <span>학점: {curriculum.credits}</span>
                  <span>학기: {curriculum.semester}</span>
                </div>
              </div>
              <Badge variant={curriculum.status === '진행 중' ? 'warning' : 'success'}>
                {curriculum.status}
              </Badge>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 진행률</p>
                  <p className="mt-1 text-2xl font-bold text-primary-600">20% (3/15주)</p>
                </div>
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/5 bg-primary-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 탭 */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            강의 계획
          </button>
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'outcomes'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            학습 목표
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'assessment'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            평가 방법
          </button>
        </div>

        {/* 강의 계획 */}
        {activeTab === 'overview' && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">주차별 강의 계획</h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                  편집
                </button>
              </div>
              <div className="space-y-3">
                {weeks.map((week) => (
                  <div key={week.week} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-gray-700">W{week.week}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{week.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              강의 {week.lectures}개 • 과제 {week.assignments}개
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(week.status)}>
                        {week.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {week.topics.map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 학습 목표 */}
        {activeTab === 'outcomes' && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">학습 목표 (Learning Outcomes)</h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                  추가
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                본 과목을 통해 학생들이 다음의 역량을 습득하게 됩니다:
              </p>
              <div className="space-y-3">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-primary-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{outcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 평가 방법 */}
        {activeTab === 'assessment' && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">성적 평가 방법</h2>
              <div className="space-y-3">
                {assessmentMethods.map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{assessment.method}</p>
                      <p className="text-xs text-gray-500 mt-1">{assessment.date}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{assessment.weight}%</p>
                      </div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${assessment.weight}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">총 배점</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assessmentMethods.reduce((sum, a) => sum + a.weight, 0)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 커리큘럼 통계 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 강의시간</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">45</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">시간</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">과제 수</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">5</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">개</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">남은 주차</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">주</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CurriculumPage
