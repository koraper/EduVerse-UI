import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useApiError } from '@/hooks/useApiError'
import { useToast } from '@/components/common'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Loading from '@/components/common/Loading'

interface Course {
  id: number
  name: string
  semester: string
  year: number
  curriculumName: string
  professorName: string
  studentCount: number
  invitationCode: string
  progress?: number
  assignmentCount?: number
  completedAssignments?: number
}

const CoursesPage = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { handleResponseError, handleError } = useApiError({
    onAuthError: () => navigate('/login'),
  })
  const { addToast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  const [enrollError, setEnrollError] = useState('')
  const [isEnrolling, setIsEnrolling] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const endpoint = user?.role === 'professor' ? '/api/courses/teaching' : '/api/courses/enrolled'
      const response = await fetch(endpoint, {
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
        setCourses(data.data.courses)
      } else {
        throw new Error(data.message || '과목 조회에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!invitationCode.trim()) {
      addToast('초대 코드를 입력해주세요', { variant: 'warning' })
      return
    }

    setIsEnrolling(true)
    setEnrollError('')

    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationCode }),
      })

      // 응답 상태 코드 검증
      if (!response.ok) {
        await handleResponseError(response)
        setIsEnrolling(false)
        return
      }

      const data = await response.json()

      if (data.status === 'success') {
        setIsEnrollModalOpen(false)
        setInvitationCode('')
        addToast('수강 신청이 완료되었습니다', { variant: 'success' })
        fetchCourses()
      } else {
        throw new Error(data.message || '수강 신청에 실패했습니다')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsEnrolling(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success-500'
    if (progress >= 50) return 'bg-warning-500'
    return 'bg-error-500'
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    )
  }

  // 에러 상태 UI
  if (hasError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user?.role === 'professor' ? '내 수업' : '내 수강 과목'}
            </h1>
          </div>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-error-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-error-900">과목 로드 실패</h3>
              </div>
              <p className="text-sm text-error-700 mb-4">
                과목 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
              <button
                onClick={fetchCourses}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user?.role === 'professor' ? '내 수업' : '내 수강 과목'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === 'professor'
                ? '진행 중인 수업을 관리하세요'
                : '수강 중인 과목을 확인하세요'}
            </p>
          </div>

          {user?.role === 'student' && (
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              수강 신청
            </Button>
          )}
        </div>

        {/* 과목 목록 */}
        {courses.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {user?.role === 'professor' ? '진행 중인 수업이 없습니다' : '수강 중인 과목이 없습니다'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {user?.role === 'professor'
                  ? '새로운 수업을 생성하여 시작하세요'
                  : '초대 코드를 입력하여 과목을 수강 신청하세요'}
              </p>
              {user?.role === 'student' && (
                <Button onClick={() => setIsEnrollModalOpen(true)}>
                  수강 신청하기
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="p-6">
                  {/* 과목 헤더 */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {course.name}
                      </h3>
                      <Badge variant="blue" size="sm">
                        {course.semester}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{course.curriculumName}</p>
                  </div>

                  {/* 교수/학생 정보 */}
                  <div className="mb-4 space-y-2">
                    {user?.role === 'student' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{course.professorName} 교수</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>수강생 {course.studentCount}명</span>
                    </div>
                  </div>

                  {/* 진도율 (학생만) */}
                  {user?.role === 'student' && course.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">학습 진도</span>
                        <span className="text-sm font-semibold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(course.progress)}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 과제 현황 (학생만) */}
                  {user?.role === 'student' && course.assignmentCount !== undefined && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">과제 완료</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {course.completedAssignments} / {course.assignmentCount}
                      </span>
                    </div>
                  )}

                  {/* 초대 코드 (교수만) */}
                  {user?.role === 'professor' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">초대 코드</span>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-primary-600">
                          {course.invitationCode}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 수강 신청 모달 */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false)
          setInvitationCode('')
          setEnrollError('')
        }}
        title="수강 신청"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            교수님께 받은 초대 코드를 입력하여 과목을 수강 신청하세요.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              초대 코드 <span className="text-error-500">*</span>
            </label>
            <Input
              value={invitationCode}
              onChange={(e) => {
                setInvitationCode(e.target.value.toUpperCase())
                setEnrollError('')
              }}
              placeholder="ABC123"
              error={enrollError}
              maxLength={6}
              className="font-mono"
            />
            <p className="mt-2 text-xs text-gray-500">
              초대 코드는 6자리 영문/숫자 조합입니다
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEnrollModalOpen(false)
                setInvitationCode('')
                setEnrollError('')
              }}
              disabled={isEnrolling}
            >
              취소
            </Button>
            <Button
              onClick={handleEnroll}
              loading={isEnrolling}
            >
              수강 신청
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default CoursesPage
