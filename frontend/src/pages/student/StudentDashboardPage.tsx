import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import StudentLayout from '@/components/layout/StudentLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'

interface Course {
  id: number
  name: string
  professor: string
  code: string
  students: number
  progress: number
  status: 'pending' | 'ongoing' | 'completed'
  department: string
  semester: string
  section: string
  completedLessons: number
  totalLessons: number
  participationRate: number
  assignmentSuccessRate: number
  currentWeek?: number
  currentLessonTitle?: string
  isCompletedLesson?: boolean
}

const StudentDashboardPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  // 상태 관리
  const [selectedStatuses, setSelectedStatuses] = useState<Set<'pending' | 'ongoing' | 'completed'>>(
    new Set(['ongoing'])
  )

  // Mock 과목 데이터
  const courses: Course[] = useMemo(
    () => [
      {
        id: 1,
        name: '자료구조론',
        professor: '홍길동 교수',
        code: 'CS101',
        students: 45,
        progress: 65,
        status: 'ongoing',
        department: '컴퓨터공학과',
        semester: '2025년 1학기',
        section: 'A반',
        completedLessons: 8,
        totalLessons: 12,
        participationRate: 67,
        assignmentSuccessRate: 83,
        currentWeek: 8,
        currentLessonTitle: '이진 탐색 트리',
      },
      {
        id: 2,
        name: '알고리즘',
        professor: '김영희 교수',
        code: 'CS202',
        students: 38,
        progress: 78,
        status: 'ongoing',
        department: '컴퓨터공학과',
        semester: '2025년 1학기',
        section: 'B반',
        completedLessons: 9,
        totalLessons: 12,
        participationRate: 75,
        assignmentSuccessRate: 91,
        currentWeek: 9,
        currentLessonTitle: '동적 프로그래밍 기초',
        isCompletedLesson: true,
      },
      {
        id: 3,
        name: '데이터베이스',
        professor: '이준호 교수',
        code: 'CS303',
        students: 52,
        progress: 45,
        status: 'pending',
        department: '정보통신과',
        semester: '2025년 1학기',
        section: 'A반',
        completedLessons: 0,
        totalLessons: 15,
        participationRate: 0,
        assignmentSuccessRate: 0,
      },
      {
        id: 4,
        name: '웹 프로그래밍',
        professor: '박수진 교수',
        code: 'CS404',
        students: 35,
        progress: 82,
        status: 'completed',
        department: '컴퓨터공학과',
        semester: '2024년 2학기',
        section: 'C반',
        completedLessons: 16,
        totalLessons: 16,
        participationRate: 94,
        assignmentSuccessRate: 94,
      },
    ],
    []
  )

  // 필터링된 과목 데이터
  const filteredCourses = useMemo(
    () => courses.filter((course) => selectedStatuses.has(course.status)),
    [courses, selectedStatuses]
  )

  // 상태 토글 핸들러
  const toggleStatus = (status: 'pending' | 'ongoing' | 'completed') => {
    const newStatuses = new Set(selectedStatuses)
    if (newStatuses.has(status)) {
      newStatuses.delete(status)
    } else {
      newStatuses.add(status)
    }
    setSelectedStatuses(newStatuses)
  }

  // FAQ 데이터
  const faqs = [
    {
      id: 1,
      question: '초대코드는 어디서 얻을 수 있나요?',
      answer: '교수님으로부터 이메일 또는 LMS를 통해 초대코드를 받을 수 있습니다.',
    },
    {
      id: 2,
      question: '과제 제출 기한을 놓쳤어요. 어떻게 되나요?',
      answer: '교수님께 연락하여 상황을 설명하시면 연장 가능 여부를 판단하실 수 있습니다.',
    },
    {
      id: 3,
      question: '내 성적은 어디서 확인할 수 있나요?',
      answer: '좌측 사이드바의 "성적" 메뉴에서 과목별 성적을 확인할 수 있습니다.',
    },
    {
      id: 4,
      question: '프로필 정보를 수정하려면?',
      answer: '우상단의 프로필 메뉴에서 "설정"을 선택하여 개인정보를 수정할 수 있습니다.',
    },
  ]

  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading) {
      return
    }

    // 학생이 아니면 역할별 대시보드로 리다이렉트
    if (user && user.role !== 'student') {
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'professor') {
        navigate('/professor/dashboard')
      }
      return
    }

    // 비인증 사용자 리다이렉트
    if (!user) {
      navigate('/login')
      return
    }

    // 이메일 인증 완료 후 첫 방문인 경우 환영 메시지 표시
    if (location.state?.fromEmailVerification) {
      setShowWelcome(true)
      setTimeout(() => setShowWelcome(false), 5000)
    }
  }, [user, authLoading, navigate, location])

  const handleInviteSubmit = () => {
    if (!inviteCode.trim()) {
      setInviteError('초대코드를 입력해주세요.')
      return
    }

    if (inviteCode.length !== 6) {
      setInviteError('초대코드는 6자리입니다.')
      return
    }

    // 영어와 숫자만 포함하는지 확인 (대소문자 구분 없음)
    if (!/^[A-Z0-9]{6}$/.test(inviteCode)) {
      setInviteError('초대코드는 영어와 숫자의 조합이어야 합니다.')
      return
    }

    console.log('초대코드 제출:', inviteCode)
    setInviteCode('')
    setInviteError('')
    setInviteModalOpen(false)
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* 환영 메시지 */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">환영합니다!</h2>
                <p className="text-white/90 text-sm">
                  {user?.name}님, EduVerse에 오신 것을 환영합니다.
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-600">
            수강 중인 과목을 한눈에 확인하고 관리하세요
          </p>
        </div>

        {/* 섹션 1: 초대코드로 수업 참여하기 */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* 좌측 아이콘 */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h4m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                </div>
              </div>

              {/* 중앙 텍스트 및 버튼 */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">초대코드로 수업 참여하기</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        새로운 수업
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      교수님으로부터 받은 6자리 초대코드(영어+숫자)를 입력하여 새로운 수업에 참여하세요.
                      <span className="font-medium text-green-600"> 코드는 이메일이나 학사공지사항</span>을 통해 제공됩니다.
                    </p>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="mt-4">
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    초대코드 입력
                  </button>
                </div>
              </div>

              {/* 우측 데코레이션 */}
              <div className="hidden sm:block flex-shrink-0">
                <svg className="w-20 h-20 text-green-200 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 7.707a1 1 0 011.414-1.414L8 9.586l6.293-6.293a1 1 0 111.414 1.414l-7 7a1 1 0 01-1.414 0l-4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* 섹션 2: 내 수강 과목 */}
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">내 수강 과목</h2>
                <p className="mt-1 text-sm text-gray-600">
                  현재 수강 중인 과목은 총 {filteredCourses.length}개입니다
                </p>
              </div>

            </div>
          </div>

          {/* 필터 토글 */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => toggleStatus('pending')}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                selectedStatuses.has('pending')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              예정
            </button>
            <button
              onClick={() => toggleStatus('ongoing')}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                selectedStatuses.has('ongoing')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              진행 중
            </button>
            <button
              onClick={() => toggleStatus('completed')}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                selectedStatuses.has('completed')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              완료
            </button>
          </div>

          {/* 카드 뷰 */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} hoverable>
                  <div className="p-6 flex flex-col h-full">
                    {/* 1. 수업명과 상태 배지 */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">{course.name}</h3>
                      <Badge variant={
                        course.status === 'pending' ? 'secondary' :
                        course.status === 'ongoing' ? 'primary' :
                        'success'
                      } className="flex-shrink-0">
                        {course.status === 'pending' ? '예정' :
                         course.status === 'ongoing' ? '진행 중' :
                         '완료'}
                      </Badge>
                    </div>

                    {/* 2. 담당교수명 & 3. 학과명배지 */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-600">{course.professor}</p>
                      <Badge variant="secondary" className="flex-shrink-0">{course.department}</Badge>
                    </div>

                    {/* 4. 학기 - 반 정보 */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-xs text-gray-500">{course.semester} - {course.section}</p>
                    </div>

                    {/* 현재 진행 중인 주차 정보 */}
                    {course.currentWeek && course.currentLessonTitle && (
                      <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between gap-3 ${
                        course.isCompletedLesson
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex-1">
                          <p className={`text-xs font-medium mb-1 ${
                            course.isCompletedLesson
                              ? 'text-gray-600'
                              : 'text-red-600'
                          }`}>
                            {course.isCompletedLesson ? '최근 수업' : '수업 중'}
                          </p>
                          <p className={`text-sm font-semibold ${
                            course.isCompletedLesson
                              ? 'text-gray-900'
                              : 'text-red-900'
                          }`}>{course.currentWeek}차시 : {course.currentLessonTitle}</p>
                        </div>
                        {!course.isCompletedLesson && (
                          <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 font-medium text-xs whitespace-nowrap transition-colors flex-shrink-0">
                            바로 수업 참여
                          </button>
                        )}
                      </div>
                    )}

                    {/* 5. 수업 진행률: progress bar chart (8/12차시), chart 위에 % 표시 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">수업 진행률</span>
                        <span className="text-xs font-semibold text-primary-600">{Math.round((course.completedLessons / course.totalLessons) * 100)}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{course.totalLessons}차시 중 {course.completedLessons}차시까지 진행</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(course.completedLessons / course.totalLessons) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 6. 수업 참여율: progress bar chart (6/12차시), chart 위에 % 표시 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">수업 참여율</span>
                        <span className="text-xs font-semibold text-blue-600">{course.participationRate}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">수업 완료된 {course.completedLessons}차시 중 {Math.round((course.participationRate / 100) * course.completedLessons)}차시 참여</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.participationRate}%` }}
                        />
                      </div>
                    </div>

                    {/* 7. 과제 성공률: progress bar chart (15/18개), chart 위에 % 표시 */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-600">과제 성공률</span>
                          <span className="text-xs text-gray-500">(참여한 수업 한정)</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">{course.assignmentSuccessRate}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">총 18개 과제 중 {Math.round((course.assignmentSuccessRate / 100) * 18)}개 성공</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.assignmentSuccessRate}%` }}
                        />
                      </div>
                    </div>

                    {/* 8. 학습하기 버튼 */}
                    <button className="w-full mt-auto px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 font-medium text-sm transition-colors">
                      학습하기
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="p-12 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">해당하는 수업이 없습니다</h3>
                <p className="text-sm text-gray-600 mb-6">
                  선택한 필터에 해당하는 수업이 없습니다. 다른 필터를 선택해보세요.
                </p>
                <button
                  onClick={() => setSelectedStatuses(new Set(['ongoing']))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  필터 초기화
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* 섹션 3: 자주하는 질문 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">자주하는 질문</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-200">
                    {faq.answer}
                  </div>
                </details>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 초대코드 입력 모달 */}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="초대코드로 수업 참여">
        <p className="text-sm text-gray-600 mb-6">
          교수님으로부터 받은 6자리 초대코드(영어+숫자)를 입력하세요.
        </p>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="예: ABC123"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value.toUpperCase())
              setInviteError('')
            }}
            maxLength={6}
            className="text-center uppercase"
          />
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setInviteModalOpen(false)
              setInviteCode('')
              setInviteError('')
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleInviteSubmit}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            참여하기
          </button>
        </div>
      </Modal>
    </StudentLayout>
  )
}

export default StudentDashboardPage
