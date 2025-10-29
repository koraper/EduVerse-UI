import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card, Badge, Button, Input, Modal } from '@/components/common'
import { MessageCircle, MessageSquare, Search, Filter, Send, CheckCircle2, Clock, Calendar, BookOpen, ArrowLeft } from 'lucide-react'
import { useApiError } from '@/hooks/useApiError'

interface Question {
  id: number
  lessonId: number
  lessonTitle: string
  lessonWeek: number
  studentId: number
  studentName: string
  question: string
  answer?: string
  status: 'pending' | 'answered'
  createdAt: string
  answeredAt?: string
  answeredBy?: string
}

const QnaPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const handleError = useApiError()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  // URL 파라미터에서 현재 필터 값 가져오기 (상태 없이 직접 계산)
  const filterParam = searchParams.get('filter')
  const statusFilter = (filterParam === 'pending' || filterParam === 'answered') ? filterParam : 'all'
  const lessonIdParam = searchParams.get('lesson')
  const lessonIdFilter = lessonIdParam ? parseInt(lessonIdParam, 10) : null

  // Auth check
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'student') {
      navigate(`/${user.role}/dashboard`)
    }
  }, [user, authLoading, navigate])

  // Load demo questions
  useEffect(() => {
    if (user?.role === 'student') {
      setLoading(true)

      // 데모 데이터
      const demoQuestions: Question[] = [
        {
          id: 1,
          lessonId: 1,
          lessonTitle: '변수와 자료형',
          lessonWeek: 1,
          studentId: user.id,
          studentName: user.name,
          question: '변수를 선언할 때 let과 const의 차이점이 무엇인가요? 어떤 상황에서 각각을 사용해야 하나요?',
          answer: 'let은 재할당이 가능한 변수를 선언할 때 사용하고, const는 재할당이 불가능한 상수를 선언할 때 사용합니다. 일반적으로 값이 변경되지 않는 경우 const를 사용하는 것이 좋으며, 값이 변경될 필요가 있을 때만 let을 사용하는 것을 권장합니다.',
          status: 'answered',
          createdAt: '2025-01-15 10:30',
          answeredAt: '2025-01-15 14:20',
          answeredBy: '김교수'
        },
        {
          id: 2,
          lessonId: 2,
          lessonTitle: '조건문과 반복문',
          lessonWeek: 2,
          studentId: user.id,
          studentName: user.name,
          question: 'for...of와 for...in 반복문의 차이점을 설명해주세요. 각각 언제 사용하는 것이 적절한가요?',
          answer: 'for...of는 배열이나 이터러블 객체의 값을 순회할 때 사용하고, for...in은 객체의 속성(키)을 순회할 때 사용합니다. 배열을 다룰 때는 for...of를 사용하고, 객체의 속성을 확인할 때는 for...in을 사용하는 것이 좋습니다.',
          status: 'answered',
          createdAt: '2025-01-16 11:45',
          answeredAt: '2025-01-16 15:30',
          answeredBy: '김교수'
        },
        {
          id: 3,
          lessonId: 3,
          lessonTitle: '함수의 이해',
          lessonWeek: 3,
          studentId: user.id,
          studentName: user.name,
          question: '화살표 함수와 일반 함수의 차이점이 무엇인가요? 특히 this 바인딩 관련해서 설명해주세요.',
          status: 'pending',
          createdAt: '2025-01-18 09:20'
        },
        {
          id: 4,
          lessonId: 4,
          lessonTitle: '리스트와 튜플',
          lessonWeek: 4,
          studentId: user.id,
          studentName: user.name,
          question: 'map(), filter(), reduce() 메서드의 차이점과 각각의 사용 사례를 알려주세요.',
          answer: 'map()은 배열의 각 요소를 변환하여 새로운 배열을 만들 때, filter()는 조건에 맞는 요소만 추출할 때, reduce()는 배열의 모든 요소를 하나의 값으로 축약할 때 사용합니다. 예를 들어, 가격 배열에서 할인 가격 계산은 map, 특정 가격 이상 필터링은 filter, 총합 계산은 reduce를 사용합니다.',
          status: 'answered',
          createdAt: '2025-01-19 14:15',
          answeredAt: '2025-01-19 16:45',
          answeredBy: '이교수'
        },
        {
          id: 5,
          lessonId: 4,
          lessonTitle: '리스트와 튜플',
          lessonWeek: 4,
          studentId: user.id,
          studentName: user.name,
          question: '스프레드 연산자(...)의 사용법과 실제 활용 예시를 알려주세요.',
          status: 'pending',
          createdAt: '2025-01-20 10:00'
        },
        {
          id: 6,
          lessonId: 5,
          lessonTitle: '딕셔너리와 집합',
          lessonWeek: 5,
          studentId: user.id,
          studentName: user.name,
          question: 'Map과 일반 객체의 차이점이 무엇인가요? 언제 Map을 사용하는 것이 더 좋을까요?',
          answer: 'Map은 키로 어떤 타입이든 사용 가능하고, 순서가 보장되며, size 속성으로 크기를 쉽게 확인할 수 있습니다. 일반 객체는 문자열/심볼만 키로 사용 가능합니다. 키가 다양한 타입이거나 자주 추가/삭제되는 경우, 또는 순서가 중요한 경우 Map을 사용하는 것이 좋습니다.',
          status: 'answered',
          createdAt: '2025-01-21 13:30',
          answeredAt: '2025-01-21 17:00',
          answeredBy: '이교수'
        },
        {
          id: 7,
          lessonId: 5,
          lessonTitle: '딕셔너리와 집합',
          lessonWeek: 5,
          studentId: user.id,
          studentName: user.name,
          question: 'Set을 사용하면 어떤 장점이 있나요? 배열 대신 Set을 사용하는 것이 좋은 경우는 언제인가요?',
          status: 'pending',
          createdAt: '2025-01-22 11:20'
        },
        {
          id: 8,
          lessonId: 3,
          lessonTitle: '함수의 이해',
          lessonWeek: 3,
          studentId: user.id,
          studentName: user.name,
          question: '콜백 함수가 무엇인지, 그리고 비동기 처리에서 어떻게 사용되는지 설명해주세요.',
          answer: '콜백 함수는 다른 함수의 인자로 전달되어 나중에 호출되는 함수입니다. 비동기 작업(API 호출, 파일 읽기 등)이 완료된 후 실행될 코드를 콜백으로 전달합니다. 하지만 콜백이 중첩되면 "콜백 지옥"이 발생할 수 있어, 최근에는 Promise나 async/await를 더 많이 사용합니다.',
          status: 'answered',
          createdAt: '2025-01-17 15:40',
          answeredAt: '2025-01-17 18:10',
          answeredBy: '김교수'
        }
      ]

      // 날짜 기준 내림차순 정렬 (최신순)
      const sortedQuestions = demoQuestions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setQuestions(sortedQuestions)
      setLoading(false)
    }
  }, [user])

  // Filter questions - useMemo로 변경하여 불필요한 리렌더링 방지
  const filteredQuestions = useMemo(() => {
    let filtered = questions

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter)
    }

    // Lesson filter
    if (lessonIdFilter !== null) {
      filtered = filtered.filter(q => q.lessonId === lessonIdFilter)
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(term) ||
        q.lessonTitle.toLowerCase().includes(term) ||
        (q.answer && q.answer.toLowerCase().includes(term))
      )
    }

    return filtered
  }, [questions, statusFilter, lessonIdFilter, searchTerm])

  // 필터 변경 핸들러 - URL만 업데이트 (상태는 useEffect에서 자동 동기화)
  const handleFilterChange = (filter: 'all' | 'pending' | 'answered') => {
    if (filter === 'all') {
      setSearchParams({}, { replace: true }) // 파라미터 제거, replace로 깜빡임 방지
    } else {
      setSearchParams({ filter }, { replace: true }) // 파라미터 설정, replace로 깜빡임 방지
    }
  }

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !selectedLessonId) return

    try {
      const response = await fetch('/api/student/qna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          question: newQuestion
        })
      })

      if (!response.ok) throw await response.json()

      const data = await response.json()
      setQuestions([data.data, ...questions])
      setNewQuestion('')
      setSelectedLessonId(null)
      setIsModalOpen(false)
    } catch (error) {
      handleError(error)
    }
  }

  const getStatusBadge = (status: 'pending' | 'answered') => {
    if (status === 'answered') {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          답변 완료
        </Badge>
      )
    }
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        답변 대기
      </Badge>
    )
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={`text-lg ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            로딩 중...
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                질의응답
              </h1>
              <p className={`mt-2 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                학습 중 궁금한 내용을 질문하고 답변을 받아보세요
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            새 질문 작성
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <Input
                    type="text"
                    placeholder="질문 내용 또는 차시명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? currentTheme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : currentTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => handleFilterChange('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'pending'
                      ? currentTheme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : currentTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  답변 대기
                </button>
                <button
                  onClick={() => handleFilterChange('answered')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'answered'
                      ? currentTheme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : currentTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  답변 완료
                </button>
              </div>
            </div>

            <div className={`text-sm ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              총 {filteredQuestions.length}개의 질문
            </div>
          </div>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
                  currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-lg ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {searchTerm || statusFilter !== 'all'
                    ? '검색 결과가 없습니다'
                    : '아직 질문이 없습니다'}
                </p>
              </div>
            </Card>
          ) : (
            filteredQuestions.map((q) => (
              <Card key={q.id}>
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className={`w-4 h-4 ${
                          currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {q.lessonWeek}차시 - {q.lessonTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${
                          currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm ${
                          currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {q.createdAt}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(q.status)}
                  </div>

                  {/* Question */}
                  <div className={`p-4 rounded-lg border ${
                    currentTheme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <MessageCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        currentTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium mb-1 ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          질문
                        </p>
                        <p className={`${
                          currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {q.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {q.answer && (
                    <div className={`p-4 rounded-lg border ${
                      currentTheme === 'dark'
                        ? 'bg-blue-900/20 border-blue-700'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <MessageSquare className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-medium ${
                              currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                            }`}>
                              답변
                            </p>
                            {q.answeredAt && (
                              <span className={`text-xs ${
                                currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                {q.answeredAt} {q.answeredBy ? `· ${q.answeredBy}` : ''}
                              </span>
                            )}
                          </div>
                          <p className={`${
                            currentTheme === 'dark' ? 'text-blue-100' : 'text-blue-900'
                          }`}>
                            {q.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* New Question Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setNewQuestion('')
            setSelectedLessonId(null)
          }}
          title="새 질문 작성"
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                차시 선택
              </label>
              <select
                value={selectedLessonId || ''}
                onChange={(e) => setSelectedLessonId(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">차시를 선택하세요</option>
                <option value="1">1차시 - 변수와 자료형</option>
                <option value="2">2차시 - 조건문과 반복문</option>
                <option value="3">3차시 - 함수의 이해</option>
                <option value="4">4차시 - 리스트와 튜플</option>
                <option value="5">5차시 - 딕셔너리와 집합</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                질문 내용
              </label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="질문 내용을 입력하세요..."
                rows={6}
                className={`w-full px-4 py-2 rounded-lg border resize-none ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setNewQuestion('')
                  setSelectedLessonId(null)
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || !selectedLessonId}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                질문 제출
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </StudentLayout>
  )
}

export default QnaPage
