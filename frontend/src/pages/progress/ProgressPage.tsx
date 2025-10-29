import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import StudentLayout from '@/components/layout/StudentLayout'
import { Card } from '@/components/common'
import { TrendingUp, ArrowLeft, Star, Award, Target, CheckCircle2 } from 'lucide-react'

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
}

const ProgressPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<LessonProgress[]>([])

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
          attendance: 'completed'
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
          attendance: 'completed'
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
          attendance: 'completed'
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
      <div className="max-w-6xl mx-auto space-y-6">
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
              </div>
              <p className={`text-sm font-medium mb-0.5 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                개념 이해도
              </p>
              <div className={`text-2xl font-bold mb-0.5 ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {totalConceptUnderstanding}
              </div>
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

        {/* 차시별 상세 리스트 (완료된 차시 모두 표시) */}
        <div className="space-y-2">
          {lessons.filter(lesson => lesson.status === 'completed').map((lesson) => (
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
                    <p className={`text-sm font-medium truncate ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {lesson.lessonTitle}
                    </p>

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
