import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'

const StudentsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Mock 학생 데이터
  const allStudents = [
    {
      id: 1,
      name: '김학생',
      studentId: '2021001',
      email: 'kim@university.ac.kr',
      enrolledCourses: 4,
      attendance: 92,
      averageGrade: 'A',
      status: '우수',
      joinDate: '2023-03-01',
    },
    {
      id: 2,
      name: '이학생',
      studentId: '2021002',
      email: 'lee@university.ac.kr',
      enrolledCourses: 4,
      attendance: 88,
      averageGrade: 'B+',
      status: '양호',
      joinDate: '2023-03-01',
    },
    {
      id: 3,
      name: '박학생',
      studentId: '2021003',
      email: 'park@university.ac.kr',
      enrolledCourses: 3,
      attendance: 65,
      averageGrade: 'D+',
      status: '주의',
      joinDate: '2023-03-01',
    },
    {
      id: 4,
      name: '최학생',
      studentId: '2021004',
      email: 'choi@university.ac.kr',
      enrolledCourses: 4,
      attendance: 95,
      averageGrade: 'A',
      status: '우수',
      joinDate: '2023-03-01',
    },
    {
      id: 5,
      name: '정학생',
      studentId: '2021005',
      email: 'jung@university.ac.kr',
      enrolledCourses: 2,
      attendance: 45,
      averageGrade: 'F',
      status: '부실',
      joinDate: '2023-03-01',
    },
    {
      id: 6,
      name: '강학생',
      studentId: '2021006',
      email: 'kang@university.ac.kr',
      enrolledCourses: 4,
      attendance: 82,
      averageGrade: 'B',
      status: '양호',
      joinDate: '2023-03-01',
    },
  ]

  const filteredStudents = allStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case '우수':
        return 'success'
      case '양호':
        return 'primary'
      case '주의':
        return 'warning'
      case '부실':
        return 'error'
      default:
        return 'gray'
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success'
    if (grade.startsWith('B')) return 'success'
    if (grade.startsWith('C')) return 'warning'
    if (grade.startsWith('D')) return 'warning'
    return 'error'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">학생 관리</h1>
          <p className="mt-1 text-sm text-gray-600">담당 과목의 학생들을 관리하고 모니터링하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 학생</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{allStudents.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600">평균 출석률</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">81%</p>
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
                  <p className="text-sm font-medium text-gray-600">우수 학생</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">주의 학생</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 학생 목록 */}
        <Card>
          <div className="p-6">
            {/* 검색 및 필터 */}
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="학생명, 학번, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* 학생 목록 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">학생명</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">학번</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">이메일</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">수강 과목</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">출석률</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">평균 성적</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">상태</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">조작</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr key={student.id} className={index !== filteredStudents.length - 1 ? 'border-b border-gray-100' : ''}>
                        <td className="px-4 py-4 font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 py-4 text-center text-gray-700">{student.studentId}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs text-gray-600">{student.email}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">{student.enrolledCourses}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            variant={
                              student.attendance >= 90
                                ? 'success'
                                : student.attendance >= 75
                                  ? 'primary'
                                  : student.attendance >= 60
                                    ? 'warning'
                                    : 'error'
                            }
                          >
                            {student.attendance}%
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={getGradeColor(student.averageGrade)}>
                            {student.averageGrade}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              student.status === '우수'
                                ? 'bg-success-100 text-success-700'
                                : student.status === '양호'
                                  ? 'bg-primary-100 text-primary-700'
                                  : student.status === '주의'
                                    ? 'bg-warning-100 text-warning-700'
                                    : 'bg-error-100 text-error-700'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                            <span>보기</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
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

            {/* 페이지네이션 */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 {filteredStudents.length}명의 학생 ({allStudents.length}명 중)
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                  이전
                </button>
                <span className="text-sm text-gray-600">1 / 1</span>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                  다음
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* 주의 학생 알림 */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">주의가 필요한 학생</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-warning-50 rounded-lg border border-warning-200">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning-900">박학생 (2021003)</p>
                  <p className="text-xs text-warning-700 mt-1">출석률 65% - 결석이 많습니다. 상담 권장</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-error-50 rounded-lg border border-error-200">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-error-900">정학생 (2021005)</p>
                  <p className="text-xs text-error-700 mt-1">성적 F - 학습 지원 프로그램 등록 필요</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default StudentsPage
