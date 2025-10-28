import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useApiError } from '@/hooks/useApiError'
import StudentLayout from '@/components/layout/StudentLayout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Loading from '@/components/common/Loading'

interface CourseDetail {
  id: number
  name: string
  semester: string
  year: number
  curriculumName: string
  curriculumDescription: string
  professorName: string
  studentCount: number
  invitationCode: string
  weeks: number
}

interface WeeklySession {
  id: number
  weekNumber: number
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt: string | null
  endedAt: string | null
  completedStudents?: number
  totalStudents?: number
  progress?: number
}

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { handleResponseError, handleError } = useApiError({
    onAuthError: () => navigate('/login'),
  })
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [sessions, setSessions] = useState<WeeklySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    fetchCourseDetail()
  }, [id])

  const fetchCourseDetail = async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const response = await fetch(`/api/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // 응답 상태 코드 검증
      if (!response.ok) {
        await handleResponseError(response)
        setHasError(true)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setCourse(data.data.course)
        setSessions(data.data.sessions || [])
      } else {
        throw new Error(data.message || '과목 정보 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">완료</Badge>
      case 'in_progress':
        return <Badge variant="warning">진행중</Badge>
      default:
        return <Badge variant="gray">예정</Badge>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'in_progress':
        return '진행중'
      default:
        return '시작 전'
    }
  }

  if (isLoading) {
    return (
      <StudentLayout>
        <Loading />
      </StudentLayout>
    )
  }

  // 에러 상태 UI
  if (hasError) {
    return (
      <StudentLayout>
        <Card>
          <div className="p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-error-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">과목 정보 로드 실패</h3>
            <p className="text-sm text-gray-500 mb-6">과목 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={fetchCourseDetail} variant="primary">다시 시도</Button>
              <Button onClick={() => navigate('/courses')} variant="outline">목록으로 돌아가기</Button>
            </div>
          </div>
        </Card>
      </StudentLayout>
    )
  }

  if (!course) {
    return (
      <StudentLayout>
        <Card>
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">과목을 찾을 수 없습니다</h3>
            <p className="text-sm text-gray-500 mb-6">요청하신 과목 정보를 불러올 수 없습니다</p>
            <Button onClick={() => navigate('/courses')}>목록으로 돌아가기</Button>
          </div>
        </Card>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </button>

        {/* 과목 정보 카드 */}
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.name}</h1>
                  <Badge variant="blue">{course.semester}</Badge>
                </div>
                <p className="text-gray-600 mb-4">{course.curriculumDescription}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{course.curriculumName}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.professorName} 교수</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>수강생 {course.studentCount}명</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{course.weeks}주 과정</span>
                  </div>
                </div>
              </div>

              {user?.role === 'professor' && (
                <div className="ml-4">
                  <div className="text-right mb-2">
                    <span className="text-sm text-gray-600">초대 코드</span>
                  </div>
                  <code className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-lg font-mono font-semibold">
                    {course.invitationCode}
                  </code>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 주차별 세션 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">주차별 학습</h2>
            {user?.role === 'professor' && (
              <Button
                size="sm"
                onClick={() => navigate(`/courses/${id}/students`)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              >
                학생 관리
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/courses/${id}/week/${session.weekNumber}`)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {session.weekNumber}주차
                    </span>
                    {getStatusBadge(session.status)}
                  </div>

                  {user?.role === 'student' && session.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">진도율</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {session.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            session.status === 'completed'
                              ? 'bg-success-500'
                              : session.status === 'in_progress'
                              ? 'bg-warning-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {user?.role === 'professor' && session.completedStudents !== undefined && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>완료 학생</span>
                        <span className="font-semibold text-gray-900">
                          {session.completedStudents} / {session.totalStudents}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {session.status === 'completed' && session.endedAt && (
                        <span>완료일: {new Date(session.endedAt).toLocaleDateString('ko-KR')}</span>
                      )}
                      {session.status === 'in_progress' && session.startedAt && (
                        <span>시작일: {new Date(session.startedAt).toLocaleDateString('ko-KR')}</span>
                      )}
                      {session.status === 'not_started' && <span>{getStatusText(session.status)}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

export default CourseDetailPage
