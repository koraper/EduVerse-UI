import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'

const GradesPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  const isStudent = user?.role === 'student'
  const isProfessor = user?.role === 'professor'

  // 학생 성적 데이터
  const studentGrades = [
    {
      id: 1,
      course: '자료구조론',
      professor: '김교수',
      midterm: 85,
      finalExam: null,
      assignment: 92,
      participation: 88,
      currentGrade: 89,
      letterGrade: 'A',
    },
    {
      id: 2,
      course: '알고리즘',
      professor: '이교수',
      midterm: 78,
      finalExam: null,
      assignment: 85,
      participation: 82,
      currentGrade: 81,
      letterGrade: 'B+',
    },
    {
      id: 3,
      course: '데이터베이스',
      professor: '박교수',
      midterm: 90,
      finalExam: null,
      assignment: 95,
      participation: 92,
      currentGrade: 92,
      letterGrade: 'A',
    },
    {
      id: 4,
      course: '운영체제',
      professor: '최교수',
      midterm: 72,
      finalExam: null,
      assignment: 79,
      participation: 75,
      currentGrade: 75,
      letterGrade: 'C+',
    },
  ]

  // 교수 - 학생 성적 관리 (한 과목 기준)
  const professorGrades = [
    {
      id: 1,
      studentName: '김학생',
      studentId: '2021001',
      midterm: 85,
      finalExam: null,
      assignment: 92,
      participation: 88,
      currentGrade: 89,
      letterGrade: 'A',
      status: '양호',
    },
    {
      id: 2,
      studentName: '이학생',
      studentId: '2021002',
      midterm: 78,
      finalExam: null,
      assignment: 85,
      participation: 82,
      currentGrade: 81,
      letterGrade: 'B+',
      status: '양호',
    },
    {
      id: 3,
      studentName: '박학생',
      studentId: '2021003',
      midterm: 65,
      finalExam: null,
      assignment: 72,
      participation: 68,
      currentGrade: 68,
      letterGrade: 'D+',
      status: '주의',
    },
    {
      id: 4,
      studentName: '최학생',
      studentId: '2021004',
      midterm: 90,
      finalExam: null,
      assignment: 95,
      participation: 92,
      currentGrade: 92,
      letterGrade: 'A',
      status: '우수',
    },
    {
      id: 5,
      studentName: '정학생',
      studentId: '2021005',
      midterm: 55,
      finalExam: null,
      assignment: 60,
      participation: 58,
      currentGrade: 57,
      letterGrade: 'F',
      status: '부실',
    },
  ]

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'gray'
    if (grade >= 90) return 'success'
    if (grade >= 80) return 'success'
    if (grade >= 70) return 'warning'
    if (grade >= 60) return 'warning'
    return 'error'
  }

  const getLetterGradeColor = (letter: string) => {
    if (letter.startsWith('A')) return 'success'
    if (letter.startsWith('B')) return 'success'
    if (letter.startsWith('C')) return 'warning'
    if (letter.startsWith('D')) return 'warning'
    return 'error'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isStudent ? '성적' : '성적 관리'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isStudent
              ? '본인의 성적 현황을 확인하세요'
              : '학생들의 성적을 입력하고 관리하세요'}
          </p>
        </div>

        {/* 학생 뷰 */}
        {isStudent && (
          <>
            {/* 전체 학점 요약 */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">학점 요약</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">총 평점</p>
                    <p className="mt-2 text-3xl font-bold text-primary-600">3.84</p>
                    <p className="text-xs text-gray-500 mt-1">4.5 기준</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">평균 학점</p>
                    <p className="mt-2 text-3xl font-bold text-primary-600">A-</p>
                    <p className="text-xs text-gray-500 mt-1">이번학기 기준</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">A 학점</p>
                    <p className="mt-2 text-3xl font-bold text-success-600">2</p>
                    <p className="text-xs text-gray-500 mt-1">4개 과목 중</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">완료 과목</p>
                    <p className="mt-2 text-3xl font-bold text-primary-600">4</p>
                    <p className="text-xs text-gray-500 mt-1">이번학기</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 과목별 성적 */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">과목별 성적</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">과목</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">중간고사</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">과제</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">참여도</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">현재학점</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">등급</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentGrades.map((grade, index) => (
                        <tr key={grade.id} className={index !== studentGrades.length - 1 ? 'border-b border-gray-100' : ''}>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{grade.course}</p>
                              <p className="text-xs text-gray-500">{grade.professor}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.midterm)}>
                              {grade.midterm}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.assignment)}>
                              {grade.assignment}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.participation)}>
                              {grade.participation}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.currentGrade)}>
                              {grade.currentGrade}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getLetterGradeColor(grade.letterGrade)}>
                              {grade.letterGrade}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 교수 뷰 */}
        {isProfessor && (
          <>
            {/* 성적 통계 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 학생</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">25</p>
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
                      <p className="text-sm font-medium text-gray-600">평균 성적</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">78</p>
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
                      <p className="text-sm font-medium text-gray-600">우수 학생</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">8</p>
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

            {/* 학생 성적 입력 */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">자료구조론 학생 성적</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    성적 입력
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-700">학생명</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">학번</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">중간고사</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">과제</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">참여도</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">현재학점</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">등급</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {professorGrades.map((grade, index) => (
                        <tr key={grade.id} className={index !== professorGrades.length - 1 ? 'border-b border-gray-100' : ''}>
                          <td className="px-4 py-4 font-medium text-gray-900">{grade.studentName}</td>
                          <td className="px-4 py-4 text-center text-gray-700">{grade.studentId}</td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.midterm)}>
                              {grade.midterm}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.assignment)}>
                              {grade.assignment}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.participation)}>
                              {grade.participation}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getGradeColor(grade.currentGrade)}>
                              {grade.currentGrade}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={getLetterGradeColor(grade.letterGrade)}>
                              {grade.letterGrade}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                grade.status === '우수'
                                  ? 'bg-success-100 text-success-700'
                                  : grade.status === '양호'
                                    ? 'bg-primary-100 text-primary-700'
                                    : grade.status === '주의'
                                      ? 'bg-warning-100 text-warning-700'
                                      : 'bg-error-100 text-error-700'
                              }`}
                            >
                              {grade.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default GradesPage
