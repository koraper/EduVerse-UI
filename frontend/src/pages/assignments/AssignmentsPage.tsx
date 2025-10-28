import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/layout/StudentLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'

const AssignmentsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

  const isStudent = user?.role === 'student'
  const isProfessor = user?.role === 'professor'

  // 학생: 할당된 과제 목록
  const studentAssignments = [
    {
      id: 1,
      title: '자료구조 설계 과제',
      course: '자료구조론',
      dueDate: '2025-10-25',
      status: 'in_progress',
      submissionCount: 0,
    },
    {
      id: 2,
      title: '알고리즘 분석 리포트',
      course: '알고리즘',
      dueDate: '2025-10-28',
      status: 'pending',
      submissionCount: 0,
    },
    {
      id: 3,
      title: '중간고사 대비 문제풀이',
      course: '데이터베이스',
      dueDate: '2025-10-20',
      status: 'completed',
      submissionCount: 1,
    },
  ]

  // 교수: 과제 관리 목록
  const professorAssignments = [
    {
      id: 1,
      title: '자료구조 설계 과제',
      course: '자료구조론 (분반 A)',
      createdDate: '2025-10-10',
      dueDate: '2025-10-25',
      totalStudents: 25,
      submitted: 18,
      graded: 5,
    },
    {
      id: 2,
      title: '알고리즘 분석 리포트',
      course: '알고리즘 (분반 B)',
      createdDate: '2025-10-12',
      dueDate: '2025-10-28',
      totalStudents: 22,
      submitted: 8,
      graded: 0,
    },
    {
      id: 3,
      title: '중간고사 대비 문제풀이',
      course: '데이터베이스 (분반 C)',
      createdDate: '2025-10-05',
      dueDate: '2025-10-20',
      totalStudents: 28,
      submitted: 28,
      graded: 28,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'warning'
      case 'pending':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '제출완료'
      case 'in_progress':
        return '진행중'
      case 'pending':
        return '예정'
      default:
        return '미제출'
    }
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isStudent ? '과제' : '과제 관리'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isStudent
              ? '제출해야 할 과제를 확인하고 관리하세요'
              : '학생들의 과제 제출 상황을 관리하고 채점하세요'}
          </p>
        </div>

        {/* 학생 뷰 */}
        {isStudent && (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">진행 중인 과제</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">3</p>
                    </div>
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">제출 완료</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">1</p>
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
                      <p className="text-sm font-medium text-gray-600">마감 임박</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">1</p>
                    </div>
                    <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 과제 목록 */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">내 과제</h2>
                <div className="space-y-3">
                  {studentAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{assignment.course}</p>
                          </div>
                          <Badge variant={getStatusColor(assignment.status)}>
                            {getStatusLabel(assignment.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">마감: {assignment.dueDate}</p>
                      </div>
                      <button className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 교수 뷰 */}
        {isProfessor && (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">생성한 과제</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">전체 제출</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">54</p>
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
                      <p className="text-sm font-medium text-gray-600">미채점</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">23</p>
                    </div>
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <p className="text-sm font-medium text-gray-600">채점 완료</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">33</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 과제 관리 목록 */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">과제 관리</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    새 과제 생성
                  </button>
                </div>
                <div className="space-y-3">
                  {professorAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{assignment.course}</p>
                        </div>
                        <div className="flex items-center space-x-6 mt-3">
                          <div className="text-xs">
                            <p className="text-gray-500">제출: {assignment.submitted}/{assignment.totalStudents}</p>
                          </div>
                          <div className="text-xs">
                            <p className="text-gray-500">채점: {assignment.graded}/{assignment.submitted}</p>
                          </div>
                          <div className="text-xs">
                            <p className="text-gray-500">마감: {assignment.dueDate}</p>
                          </div>
                        </div>
                      </div>
                      <button className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </StudentLayout>
  )
}

export default AssignmentsPage
