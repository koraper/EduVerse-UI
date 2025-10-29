import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card } from '@/components/common'
import { TrendingUp, ArrowLeft, Star, Award, Target, CheckCircle2, ChevronDown, ChevronUp, ArrowUpDown, Lightbulb, AlertTriangle, HelpCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Assignment {
  id: number
  title: string
  conceptUnderstanding: number
  codeApplication: number
  status: 'completed' | 'incomplete' | 'absent'
}

interface LessonProgress {
  id: number
  lessonTitle: string
  lessonWeek: number
  completedAt?: string
  averageScore: number
  conceptUnderstanding: number
  codeApplication: number
  status: 'completed' | 'in_progress' | 'upcoming'
  attendance?: 'completed' | 'incomplete' | 'absent'
  assignments?: Assignment[]
  meaningfulContent?: string
  difficultContent?: string
  question?: string
}

const ProgressPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<LessonProgress[]>([])
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set())
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'completed' | 'incomplete' | 'absent'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 차시 펼치기/접기 토글
  const toggleLesson = (lessonId: number) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev)
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId)
      } else {
        newSet.add(lessonId)
      }
      return newSet
    })
  }

  // 정렬 토글
  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

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

  // Load demo data
  useEffect(() => {
    if (user?.role === 'student') {
      setLoading(true)

      // 데모 데이터
      const demoLessons: LessonProgress[] = [
        {
          id: 1,
          lessonTitle: '변수와 자료형',
          lessonWeek: 1,
          completedAt: '2025-10-20',
          averageScore: 92,
          conceptUnderstanding: 95,
          codeApplication: 88,
          status: 'completed',
          attendance: 'completed',
          assignments: [
            {
              id: 1,
              title: '변수 선언 및 출력',
              conceptUnderstanding: 100,
              codeApplication: 85,
              status: 'completed'
            },
            {
              id: 2,
              title: '자료형 변환 연습',
              conceptUnderstanding: 90,
              codeApplication: 90,
              status: 'completed'
            }
          ],
          meaningfulContent: '변수의 개념과 명명 규칙을 잘 이해할 수 있었습니다.',
          difficultContent: '변수명 작성시 snake_case와 camelCase 구분이 헷갈렸습니다.',
          question: '실무에서는 주로 어떤 명명 규칙을 사용하나요?'
        },
        {
          id: 2,
          lessonTitle: '조건문과 반복문',
          lessonWeek: 2,
          completedAt: '2025-10-22',
          averageScore: 0,
          conceptUnderstanding: 0,
          codeApplication: 0,
          status: 'completed',
          attendance: 'absent'
        },
        {
          id: 3,
          lessonTitle: '함수의 이해',
          lessonWeek: 3,
          completedAt: '2025-10-25',
          averageScore: 0,
          conceptUnderstanding: 0,
          codeApplication: 0,
          status: 'completed',
          attendance: 'incomplete'
        },
        {
          id: 4,
          lessonTitle: '리스트와 튜플',
          lessonWeek: 4,
          completedAt: '2025-10-27',
          averageScore: 78,
          conceptUnderstanding: 75,
          codeApplication: 80,
          status: 'completed',
          attendance: 'completed',
          assignments: [
            {
              id: 1,
              title: '리스트 기본 연산',
              conceptUnderstanding: 80,
              codeApplication: 75,
              status: 'completed'
            },
            {
              id: 2,
              title: '튜플의 특성 이해',
              conceptUnderstanding: 70,
              codeApplication: 80,
              status: 'incomplete'
            },
            {
              id: 3,
              title: '리스트 컴프리헨션',
              conceptUnderstanding: 75,
              codeApplication: 85,
              status: 'completed'
            }
          ],
          meaningfulContent: '리스트의 인덱싱과 슬라이싱 개념을 이해했습니다.',
          difficultContent: '음수 인덱스 사용법이 처음에는 헷갈렸습니다.',
          question: '다차원 리스트는 어떻게 다루나요?'
        },
        {
          id: 5,
          lessonTitle: '딕셔너리와 집합',
          lessonWeek: 5,
          completedAt: '2025-10-29',
          averageScore: 90,
          conceptUnderstanding: 88,
          codeApplication: 92,
          status: 'completed',
          attendance: 'completed',
          assignments: [
            {
              id: 1,
              title: '딕셔너리 기본 연산',
              conceptUnderstanding: 85,
              codeApplication: 90,
              status: 'completed'
            },
            {
              id: 2,
              title: '집합 연산 활용',
              conceptUnderstanding: 90,
              codeApplication: 95,
              status: 'completed'
            },
            {
              id: 3,
              title: '딕셔너리 컴프리헨션',
              conceptUnderstanding: 80,
              codeApplication: 85,
              status: 'absent'
            },
            {
              id: 4,
              title: '중첩 딕셔너리 다루기',
              conceptUnderstanding: 88,
              codeApplication: 92,
              status: 'completed'
            },
            {
              id: 5,
              title: 'defaultdict와 Counter 활용',
              conceptUnderstanding: 95,
              codeApplication: 98,
              status: 'completed'
            }
          ],
          meaningfulContent: 'key-value 쌍의 개념과 collections 모듈의 강력함을 알게 되었습니다.',
          difficultContent: 'get() 메서드와 []의 차이, 깊은 레벨의 데이터 접근시 KeyError 처리가 어려웠습니다.',
          question: '딕셔너리에서 키가 존재하지 않을 때 기본값을 설정하는 베스트 프랙티스는?'
        }
      ]

      setLessons(demoLessons)
      setLoading(false)
    }
  }, [user])

  // 전체 통계 계산 (출석 완료한 차시만 포함)
  const completedLessons = lessons.filter(l => l.status === 'completed' && l.attendance === 'completed')
  const totalAverage = completedLessons.length > 0
    ? Math.round(completedLessons.reduce((sum, l) => sum + l.averageScore, 0) / completedLessons.length)
    : 0
  const totalConceptUnderstanding = completedLessons.length > 0
    ? Math.round(completedLessons.reduce((sum, l) => sum + l.conceptUnderstanding, 0) / completedLessons.length)
    : 0
  const totalCodeApplication = completedLessons.length > 0
    ? Math.round(completedLessons.reduce((sum, l) => sum + l.codeApplication, 0) / completedLessons.length)
    : 0

  // 주차별 차트 데이터 준비 (12차시까지 표시, 완료되지 않은 차시는 null)
  const totalWeeks = 12
  const chartData = Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1
    const lesson = lessons.find(l => l.lessonWeek === week && l.status === 'completed' && l.attendance === 'completed')
    return {
      week,
      conceptUnderstanding: lesson ? lesson.conceptUnderstanding / 20 : null,
      codeApplication: lesson ? lesson.codeApplication / 20 : null
    }
  })

  // 점수를 별점으로 변환 (100점 만점 -> 5점 만점)
  const StarRating = ({ score }: { score: number }) => {
    const rating = score / 20
    const fullStars = Math.floor(rating)
    const partialFill = rating - fullStars

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <Star key={index} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          }
          if (index === fullStars && partialFill > 0) {
            return (
              <div key={index} className="relative">
                <Star className="w-4 h-4 text-gray-400 fill-gray-400" />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${partialFill * 100}%` }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            )
          }
          return <Star key={index} className="w-4 h-4 text-gray-400 fill-gray-400" />
        })}
        <span className={`ml-2 text-sm font-medium ${
          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {rating.toFixed(1)}
        </span>
      </div>
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
      <div className="max-w-6xl min-w-[1280px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`relative group p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                currentTheme === 'dark'
                  ? 'bg-gray-900 text-white border border-gray-700'
                  : 'bg-gray-800 text-white'
              }`}>
                뒤로가기
              </div>
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                나의 성장 일기
              </h1>
              <p className={`mt-2 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                차시별 학습 성과를 확인하고 성장 과정을 분석하세요
              </p>
            </div>
          </div>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentTheme === 'dark'
                    ? 'bg-purple-900/30'
                    : 'bg-purple-100'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalAverage}
                </div>
              </div>
              <p className={`text-sm font-medium mb-0.5 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                누적 평균
              </p>
              <StarRating score={totalAverage} />
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentTheme === 'dark'
                    ? 'bg-blue-900/30'
                    : 'bg-blue-100'
                }`}>
                  <Award className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalConceptUnderstanding}
                </div>
              </div>
              <p className={`text-sm font-medium mb-0.5 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                개념 이해도
              </p>
              <StarRating score={totalConceptUnderstanding} />
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentTheme === 'dark'
                    ? 'bg-green-900/30'
                    : 'bg-green-100'
                }`}>
                  <Target className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalCodeApplication}
                </div>
              </div>
              <p className={`text-sm font-medium mb-0.5 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                코드 활용도
              </p>
              <StarRating score={totalCodeApplication} />
            </div>
          </Card>
        </div>

        {/* 주차별 성장 추이 차트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌측: 개념 이해도 바차트 */}
          <Card>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 text-center ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                개념 이해도
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey="week"
                    label={{ value: '차시', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    stroke={currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}
                    domain={[1, totalWeeks]}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    stroke={currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                      border: `1px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#111827' }}
                    itemStyle={{ color: currentTheme === 'dark' ? '#60a5fa' : '#3b82f6' }}
                    formatter={(value: any) => value !== null ? `${value.toFixed(1)}점` : '미완료'}
                    labelFormatter={(week: any) => `${week}차시`}
                  />
                  <Bar
                    dataKey="conceptUnderstanding"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="개념 이해도"
                    label={{
                      position: 'insideTop',
                      fill: '#ffffff',
                      fontSize: 11,
                      fontWeight: 600,
                      formatter: (value: any) => value !== null ? value.toFixed(1) : ''
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 우측: 코드 활용도 바차트 */}
          <Card>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 text-center ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                코드 활용도
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey="week"
                    label={{ value: '차시', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    stroke={currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}
                    domain={[1, totalWeeks]}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    stroke={currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                      border: `1px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#111827' }}
                    itemStyle={{ color: currentTheme === 'dark' ? '#34d399' : '#10b981' }}
                    formatter={(value: any) => value !== null ? `${value.toFixed(1)}점` : '미완료'}
                    labelFormatter={(week: any) => `${week}차시`}
                  />
                  <Bar
                    dataKey="codeApplication"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="코드 활용도"
                    label={{
                      position: 'insideTop',
                      fill: '#ffffff',
                      fontSize: 11,
                      fontWeight: 600,
                      formatter: (value: any) => value !== null ? value.toFixed(1) : ''
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 필터 토글 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAssignmentFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                assignmentFilter === 'all'
                  ? currentTheme === 'dark'
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-500 text-white'
                  : currentTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setAssignmentFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                assignmentFilter === 'completed'
                  ? currentTheme === 'dark'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white'
                  : currentTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              완료
            </button>
            <button
              onClick={() => setAssignmentFilter('incomplete')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                assignmentFilter === 'incomplete'
                  ? currentTheme === 'dark'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-500 text-white'
                  : currentTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              미완료
            </button>
            <button
              onClick={() => setAssignmentFilter('absent')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                assignmentFilter === 'absent'
                  ? currentTheme === 'dark'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-500 text-white'
                  : currentTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              불참
            </button>
          </div>
          <button
            onClick={toggleSort}
            className={`p-1.5 rounded transition-colors ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            title={sortOrder === 'asc' ? '오름차순 정렬 (클릭하여 내림차순)' : '내림차순 정렬 (클릭하여 오름차순)'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* 차시별 상세 리스트 (필터에 따라 표시) */}
        <div className="space-y-2">
          {lessons
            .filter(lesson => lesson.status === 'completed')
            .filter(lesson => {
              if (assignmentFilter === 'all') return true
              if (assignmentFilter === 'completed') return lesson.attendance === 'completed'
              if (assignmentFilter === 'incomplete') return lesson.attendance === 'incomplete'
              if (assignmentFilter === 'absent') return lesson.attendance === 'absent'
              return true
            })
            .sort((a, b) => {
              if (sortOrder === 'asc') {
                return a.lessonWeek - b.lessonWeek
              } else {
                return b.lessonWeek - a.lessonWeek
              }
            })
            .map((lesson) => (
            <div
              key={lesson.id}
              className={`rounded-lg p-3 transition-all duration-200 ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 border-2 border-transparent shadow-sm'
                  : 'bg-white border-2 border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 상태 아이콘 */}
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>

                {/* 차시 정보 */}
                <div className="flex-1 min-w-0">
                  {/* 첫 번째 줄: N차시 + 완료일 */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {lesson.lessonWeek}차시
                    </span>

                    <span className={`text-xs ${
                      currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {lesson.completedAt}
                    </span>
                  </div>

                  {/* 두 번째 줄: 차시 제목 + 성적 + 제출 상태 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {lesson.lessonTitle}
                      </p>

                      {/* 토글 버튼 */}
                      {lesson.attendance === 'completed' && (
                        <button
                          onClick={() => toggleLesson(lesson.id)}
                          className={`p-1 rounded transition-colors flex-shrink-0 ${
                            currentTheme === 'dark'
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {expandedLessons.has(lesson.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {lesson.attendance === 'completed' && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className={`${
                              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              개념 이해도
                            </span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className={`font-medium ${
                              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {(lesson.conceptUnderstanding / 20).toFixed(1)}
                            </span>
                          </div>
                          <span className={`${
                            currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            |
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={`${
                              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              코드 활용도
                            </span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className={`font-medium ${
                              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {(lesson.codeApplication / 20).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 제출 상태 뱃지 */}
                      <div className="flex-shrink-0">
                        {lesson.attendance === 'completed' ? (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            currentTheme === 'dark'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            완료
                          </span>
                        ) : lesson.attendance === 'absent' ? (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            currentTheme === 'dark'
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            불참
                          </span>
                        ) : lesson.attendance === 'incomplete' ? (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            currentTheme === 'dark'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            미완료
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* 펼쳐진 상태: 과제별 평가 */}
                  {expandedLessons.has(lesson.id) && lesson.attendance === 'completed' && lesson.assignments && (
                    <div className={`mt-4 pt-4 border-t ${
                      currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      {/* 과제별 하위 섹션 */}
                      <div className="space-y-3 mb-6">
                        {lesson.assignments
                          .filter(assignment => assignmentFilter === 'all' || assignment.status === assignmentFilter)
                          .map((assignment, index) => (
                          <div
                            key={assignment.id}
                            className={`p-4 rounded-lg border-2 ${
                              index % 2 === 0
                                ? currentTheme === 'dark'
                                  ? 'bg-gray-800/50 border-gray-600'
                                  : 'bg-gray-50 border-gray-300'
                                : currentTheme === 'dark'
                                ? 'bg-gray-750/50 border-gray-600'
                                : 'bg-blue-50/30 border-blue-300'
                            }`}
                          >
                            {/* 과제 제목 */}
                            <h5 className={`text-sm font-semibold mb-3 ${
                              currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {index + 1}. {assignment.title}
                            </h5>

                            {/* 개념 이해도 | 코드 활용도 */}
                            <div className="flex items-center text-xs">
                              <div className="flex items-center gap-1 w-44 pl-4">
                                <span className={`${
                                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  개념 이해도
                                </span>
                                <div className="flex items-center gap-1">
                                  <div className="flex gap-0.5">
                                    {[...Array(Math.round(assignment.conceptUnderstanding / 20))].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    ))}
                                  </div>
                                  <span className={`font-medium ${
                                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {Math.round(assignment.conceptUnderstanding / 20)}
                                  </span>
                                </div>
                              </div>
                              <span className={`mx-3 ${
                                currentTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                |
                              </span>
                              <div className="flex items-center gap-1">
                                <span className={`${
                                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  코드 활용도
                                </span>
                                <div className="flex items-center gap-1">
                                  <div className="flex gap-0.5">
                                    {[...Array(Math.round(assignment.codeApplication / 20))].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    ))}
                                  </div>
                                  <span className={`font-medium ${
                                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {Math.round(assignment.codeApplication / 20)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 차시 전체 피드백 */}
                      <div className={`p-4 rounded-lg border-2 ${
                        currentTheme === 'dark'
                          ? 'bg-gray-800/30 border-gray-600'
                          : 'bg-blue-50/50 border-blue-200'
                      }`}>
                        <div className="space-y-4">
                          {/* 가장 의미있던 내용 */}
                          {lesson.meaningfulContent && (
                            <div>
                              <p className={`text-xs font-medium mb-2 flex items-center gap-1.5 ${
                                currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                              }`}>
                                <Lightbulb className="w-4 h-4" />
                                가장 의미있던 내용은?
                              </p>
                              <div className={`p-3 rounded text-sm ${
                                currentTheme === 'dark'
                                  ? 'bg-gray-900/50 text-gray-300'
                                  : 'bg-white text-gray-700'
                              }`}>
                                {lesson.meaningfulContent}
                              </div>
                            </div>
                          )}

                          {/* 제일 어려웠던 내용 */}
                          {lesson.difficultContent && (
                            <div>
                              <p className={`text-xs font-medium mb-2 flex items-center gap-1.5 ${
                                currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
                              }`}>
                                <AlertTriangle className="w-4 h-4" />
                                제일 어려웠던 내용은?
                              </p>
                              <div className={`p-3 rounded text-sm ${
                                currentTheme === 'dark'
                                  ? 'bg-gray-900/50 text-gray-300'
                                  : 'bg-white text-gray-700'
                              }`}>
                                {lesson.difficultContent}
                              </div>
                            </div>
                          )}

                          {/* 궁금한 점이 있다면 */}
                          {lesson.question && (
                            <div>
                              <p className={`text-xs font-medium mb-2 flex items-center gap-1.5 ${
                                currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                <HelpCircle className="w-4 h-4" />
                                궁금한 점이 있다면?
                              </p>
                              <div className={`p-3 rounded text-sm ${
                                currentTheme === 'dark'
                                  ? 'bg-gray-900/50 text-gray-300'
                                  : 'bg-white text-gray-700'
                              }`}>
                                {lesson.question}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}

export default ProgressPage
