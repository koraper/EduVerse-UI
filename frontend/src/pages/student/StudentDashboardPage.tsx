import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

const StudentDashboardPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()

  // 신규 가입 여부 확인 (이메일 인증 페이지에서 넘어온 경우)
  const [isNewUser, setIsNewUser] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  // TODO: 실제로는 백엔드에서 수강 중인 수업이 0개인지 확인해야 함
  const hasNoCourses = true // 임시

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
      setIsNewUser(true)
      setShowWelcome(true)
      // 3초 후 환영 메시지 자동 숨김
      setTimeout(() => setShowWelcome(false), 5000)
    }
  }, [user, authLoading, navigate, location])

  const handleJoinClass = () => {
    if (!inviteCode.trim()) {
      alert('초대코드를 입력해주세요')
      return
    }
    // TODO: 초대코드로 수업 참여 API 호출
    console.log('초대코드:', inviteCode)
    alert(`초대코드 "${inviteCode}"로 수업 참여 요청`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 환영 메시지 (신규 가입자) */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg shadow-lg p-6 text-white animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">🎉 회원가입이 완료되었습니다!</h2>
                <p className="text-white/90 text-sm">
                  {user?.name}님, EduVerse에 오신 것을 환영합니다. 이제 초대코드를 입력하여 수업에 참여하실 수 있습니다.
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              안녕하세요, {user?.name}님!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              오늘도 즐거운 학습 되세요
            </p>
          </div>
          <Badge variant="blue">학생</Badge>
        </div>

        {/* 초대코드 입력 (수업이 없는 경우) */}
        {hasNoCourses && (
          <Card className="border-2 border-primary-200 bg-primary-50/30">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    초대코드로 수업 참여하기
                  </h3>
                  <p className="text-sm text-gray-600">
                    교수자에게 받은 초대코드를 입력하여 수업에 참여하세요
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="초대코드를 입력하세요 (예: ABC123)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinClass()}
                    className="text-center tracking-wider font-mono text-lg"
                  />
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleJoinClass}
                  disabled={!inviteCode.trim()}
                >
                  참여하기
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-500 text-center">
                초대코드는 교수자가 수업 생성 시 제공합니다
              </p>
            </div>
          </Card>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">수강 중인 과목</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">5</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-success-600 font-medium">+1 이번 주</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">완료한 과제</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">28</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-success-600 font-medium">100% 제출률</span>
              </div>
            </div>
          </Card>

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
              <div className="mt-4">
                <span className="text-xs text-warning-600 font-medium">마감 임박 1건</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 성적</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">A</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-success-600 font-medium">전체 평균 B+</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 최근 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 과제</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">자료구조 과제 #{i}</p>
                        <p className="text-xs text-gray-500">마감: {i}일 후</p>
                      </div>
                    </div>
                    <Badge variant={i === 1 ? 'warning' : 'gray'}>
                      {i === 1 ? '진행중' : '예정'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 일정</h2>
              <div className="space-y-4">
                {[
                  { time: '09:00', title: '자료구조론', location: '공학관 301호' },
                  { time: '14:00', title: '알고리즘', location: '공학관 401호' },
                  { time: '16:00', title: '오피스 아워', location: '연구실' },
                ].map((schedule, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-primary-600">{schedule.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{schedule.location}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </DashboardLayout>
  )
}

export default StudentDashboardPage
