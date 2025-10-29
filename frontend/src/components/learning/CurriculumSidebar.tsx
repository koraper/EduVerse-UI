import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import { Users, GraduationCap, Calendar, Code, ChevronDown, ChevronUp, MessageCircle, MessageSquare, Activity, BarChart3, TrendingUp, Star, StarHalf } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  week: number
  status: 'completed' | 'in_progress' | 'upcoming'
  completedAt?: string
  classDate?: string // 수업일
  attendance?: 'completed' | 'incomplete' | 'absent' // 참석 및 과제 완료 여부
  qnaStatus?: 'none' | 'question' | 'answered' // 질의응답 상태
}

interface CourseInfo {
  professor: string
  department: string
  language: string
  semester: string
  participationRate: number
  assignmentSuccessRate: number
}

interface CurriculumSidebarProps {
  lessons: Lesson[]
  totalLessons: number
  completedLessons: number
  courseInfo?: CourseInfo
  averageScore?: number // 나의 성장 기록에 표시할 평균 점수 (예: 85)
  conceptUnderstanding?: number // 나의 성장 기록에 표시할 개념 이해도 (예: 90)
  codeApplication?: number // 나의 성장 기록에 표시할 코드 활용도 (예: 75)
  totalLearningHours?: number // 나의 성장 기록에 표시할 총 학습 시간 (예: 24)
}

const CurriculumSidebar = ({
  lessons,
  totalLessons,
  completedLessons,
  courseInfo,
  averageScore,
  conceptUnderstanding, // 새롭게 추가된 prop
  codeApplication,      // 새롭게 추가된 prop
  totalLearningHours // 기존 prop
}: CurriculumSidebarProps) => {
  const navigate = useNavigate()
  const { currentTheme } = useTheme()
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(true)
  const [isGrowthExpanded, setIsGrowthExpanded] = useState(true)
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)

  // 점수를 별점으로 변환하는 컴포넌트
  const StarRating = ({ score }: { score: number }) => {
    const totalStars = 5
    const rating = score / 20 // 100점 만점을 5점 만점으로 변환
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    return (
      <div className="relative group flex items-center">
        {/* 별점 아이콘 */}
        <div className="flex">
          {[...Array(totalStars)].map((_, index) => {
            if (index < fullStars) {
              return <Star key={index} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            }
            if (index === fullStars && hasHalfStar) {
              return (
                <div key={index} className="relative">
                  <Star className="w-4 h-4 text-gray-500 fill-gray-500" />
                  <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              )
            }
            return <Star key={index} className="w-4 h-4 text-gray-500 fill-gray-500" />
          })}
        </div>
        {/* 툴팁 */}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
          currentTheme === 'dark'
            ? 'bg-gray-900 text-white border border-gray-700'
            : 'bg-gray-800 text-white'
        }`}>
          {score}%
        </div>
      </div>
    )
  }
  const completedMissionsCount = lessons.filter(l => l.status === 'completed').length;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  // 언어별 배지 색상
  const getLanguageBadgeColor = (language: string) => {
    const isDark = currentTheme === 'dark'

    switch (language) {
      case 'Python':
        return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-700 text-white'
      case 'Java':
        return isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-700 text-white'
      case 'JavaScript':
        return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-700 text-white'
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-700 text-white'
    }
  }

  return (
    <aside className={`w-80 border-r flex flex-col transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* 나의 활동 */}
      <div className={`p-6 border-b ${
        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-green-400 to-green-500'
            }`}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            나의 활동
          </h2>
          <button
            onClick={() => setIsActivitiesExpanded(!isActivitiesExpanded)}
            className={`p-1 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label={isActivitiesExpanded ? '접기' : '펼치기'}
          >
            {isActivitiesExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {isActivitiesExpanded && (
          <div className="space-y-3">
            {/* 참석 현황 */}
            <div className={`p-3 rounded-lg ${
              currentTheme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  참석 현황
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative group flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    완료 {lessons.filter(l => l.attendance === 'completed').length}
                  </span>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                    currentTheme === 'dark'
                      ? 'bg-gray-900 text-white border border-gray-700'
                      : 'bg-gray-800 text-white'
                  }`}>
                    모든 과제 완료한 차시
                  </div>
                </div>
                <div className="relative group flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    미완료 {lessons.filter(l => l.attendance === 'incomplete').length}
                  </span>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                    currentTheme === 'dark'
                      ? 'bg-gray-900 text-white border border-gray-700'
                      : 'bg-gray-800 text-white'
                  }`}>
                    과제 완료못한 차시
                  </div>
                </div>
                <div className="relative group flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    불참 {lessons.filter(l => l.attendance === 'absent').length}
                  </span>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                    currentTheme === 'dark'
                      ? 'bg-gray-900 text-white border border-gray-700'
                      : 'bg-gray-800 text-white'
                  }`}>
                    수업에 불참한 차시
                  </div>
                </div>
              </div>
            </div>

            {/* 질의응답 현황 */}
            <div className={`p-3 rounded-lg ${
              currentTheme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  질의응답
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/student/qna?filter=pending')}
                  className={`flex items-center gap-1 transition-colors rounded px-2 py-1 ${
                    currentTheme === 'dark'
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <MessageCircle className={`w-3.5 h-3.5 ${
                    currentTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    대기 {lessons.filter(l => l.qnaStatus === 'question').length}
                  </span>
                </button>
                <button
                  onClick={() => navigate('/student/qna?filter=answered')}
                  className={`flex items-center gap-1 transition-colors rounded px-2 py-1 ${
                    currentTheme === 'dark'
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 ${
                    currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    완료 {lessons.filter(l => l.qnaStatus === 'answered').length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 나의 성장 기록 */}
      <div className={`p-6 border-b ${
        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                : 'bg-gradient-to-br from-purple-400 to-purple-500'
            }`}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            나의 성장 기록
          </h2>
          <button
            onClick={() => setIsGrowthExpanded(!isGrowthExpanded)}
            className={`p-1 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label={isGrowthExpanded ? '접기' : '펼치기'}
          >
            {isGrowthExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {isGrowthExpanded && (
          <div className="space-y-4 pt-2">
            {/* 완료한 미션 */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                완료한 미션
              </span>
              <span className={`text-sm font-semibold ${
                currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {completedMissionsCount}개
              </span>
            </div>

            {/* 평균 점수 */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                평균 점수
              </span>
              <span className={`text-sm font-semibold ${
                currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {averageScore !== undefined ? `${averageScore}점` : 'N/A'}
              </span>
            </div>

            {/* 개념 이해도 */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                개념 이해도
              </span>
              <span className={`text-sm font-semibold ${
                currentTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>{conceptUnderstanding !== undefined ? <StarRating score={70} /> : 'N/A'}</span>
            </div>

            {/* 코드 활용도 */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                코드 활용도
              </span>
              <span className={`text-sm font-semibold ${
                currentTheme === 'dark' ? 'text-teal-400' : 'text-teal-600'
              }`}>{codeApplication !== undefined ? <StarRating score={codeApplication} /> : 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 학습 정보 */}
      <div className={`p-6 border-b ${
        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                : 'bg-gradient-to-br from-blue-400 to-blue-500'
            }`}>
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            학습 정보
          </h2>
          <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className={`p-1 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label={isInfoExpanded ? '접기' : '펼치기'}
          >
            {isInfoExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {isInfoExpanded && (
          <>
            {/* 1. 수업 진행률 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  수업 진행률
                </span>
                <span className={`text-sm font-semibold ${
                  currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                }`}>
                  {progressPercentage}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-primary-400 to-primary-600"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* 2. 수업 참여율 (courseInfo가 있을 때만 표시) */}
            {courseInfo && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    수업 참여율
                  </span>
                  <span className={`text-sm font-semibold ${
                    currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {courseInfo.participationRate}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${courseInfo.participationRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* 3. 과제 성공률 (courseInfo가 있을 때만 표시) */}
            {courseInfo && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    과제 성공률
                  </span>
                  <span className={`text-sm font-semibold ${
                    currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {courseInfo.assignmentSuccessRate}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-400 to-purple-600"
                    style={{ width: `${courseInfo.assignmentSuccessRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* 4-7. 수업 정보 (courseInfo가 있을 때만 표시) */}
            {courseInfo && (
              <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
                {/* 4. 담당교수 */}
                <div className="flex items-center gap-2">
                  <GraduationCap className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    담당교수
                  </span>
                  <span className={`text-xs font-medium ml-auto ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {courseInfo.professor}
                  </span>
                </div>

                {/* 5. 학과 */}
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    학과
                  </span>
                  <span className={`text-xs font-medium ml-auto ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {courseInfo.department}
                  </span>
                </div>

                {/* 6. 언어분류 */}
                <div className="flex items-center gap-2">
                  <Code className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    언어
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ml-auto ${
                    getLanguageBadgeColor(courseInfo.language)
                  }`}>
                    {courseInfo.language}
                  </span>
                </div>

                {/* 7. 학기 */}
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    학기
                  </span>
                  <span className={`text-xs font-medium ml-auto ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {courseInfo.semester}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

export default CurriculumSidebar
