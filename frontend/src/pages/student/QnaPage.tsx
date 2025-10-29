import { useState, useEffect } from 'react'
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

  // URL 파라미터에서 필터 값 가져오기
  const filterParam = searchParams.get('filter')
  const initialFilter = (filterParam === 'pending' || filterParam === 'answered') ? filterParam : 'all'

  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>(initialFilter)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

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

  // URL 파라미터 변경 감지하여 필터 업데이트
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'pending' || filterParam === 'answered') {
      setStatusFilter(filterParam)
    } else if (filterParam === null) {
      setStatusFilter('all')
    }
  }, [searchParams])

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/student/qna', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) throw await response.json()

        const data = await response.json()
        setQuestions(data.data || [])
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'student') {
      fetchQuestions()
    }
  }, [user, handleError])

  // Filter questions
  useEffect(() => {
    let filtered = questions

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter)
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

    setFilteredQuestions(filtered)
  }, [questions, statusFilter, searchTerm])

  // 필터 변경 핸들러 - URL 파라미터도 함께 업데이트
  const handleFilterChange = (filter: 'all' | 'pending' | 'answered') => {
    setStatusFilter(filter)
    if (filter === 'all') {
      setSearchParams({}) // 파라미터 제거
    } else {
      setSearchParams({ filter }) // 파라미터 설정
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
