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
}

const StudentDashboardPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()

  // 상태 관리
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

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
      },
      {
        id: 2,
        name: '알고리즘',
        professor: '김영희 교수',
        code: 'CS202',
        students: 38,
        progress: 78,
      },
      {
        id: 3,
        name: '데이터베이스',
        professor: '이준호 교수',
        code: 'CS303',
        students: 52,
        progress: 45,
      },
      {
        id: 4,
        name: '웹 프로그래밍',
        professor: '박수진 교수',
        code: 'CS404',
        students: 35,
        progress: 82,
      },
    ],
    []
  )

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

    if (inviteCode.length !== 8) {
      setInviteError('초대코드는 8자리입니다.')
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
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">초대코드로 수업 참여하기</h2>
                <p className="mt-1 text-sm text-gray-600">
                  교수님으로부터 받은 초대코드를 입력하여 새로운 수업에 참여하세요
                </p>
              </div>
              <button
                onClick={() => setInviteModalOpen(true)}
                className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                초대코드 입력
              </button>
            </div>
          </div>
        </Card>

        {/* 섹션 2: 내 수강 과목 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">내 수강 과목</h2>
              <p className="mt-1 text-sm text-gray-600">
                현재 수강 중인 과목은 총 {courses.length}개입니다
              </p>
            </div>

            {/* 뷰 전환 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'card'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="카드 보기"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="목록 보기"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 카드 뷰 */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <div className="p-6 flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">{course.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{course.professor}</p>
                        </div>
                        <Badge variant="primary">{course.code}</Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">학습 진도</span>
                        <span className="text-xs font-semibold text-primary-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div>
                        <p className="text-gray-500">수강생</p>
                        <p className="font-semibold text-gray-900">{course.students}명</p>
                      </div>
                      <div>
                        <p className="text-gray-500">진도율</p>
                        <p className="font-semibold text-gray-900">{course.progress}%</p>
                      </div>
                    </div>

                    <button className="w-full mt-auto pt-4 border-t border-gray-200 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
                      수업 바로가기 →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 목록 뷰 */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {courses.map((course) => (
                <Card key={course.id}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{course.name}</h3>
                              <Badge variant="secondary">{course.code}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{course.professor}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">학습 진도</p>
                          <p className="font-semibold text-gray-900">{course.progress}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">수강생</p>
                          <p className="font-semibold text-gray-900">{course.students}명</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
          교수님으로부터 받은 8자리 초대코드를 입력하세요.
        </p>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="예: ABC12345"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value.toUpperCase())
              setInviteError('')
            }}
            maxLength={8}
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
