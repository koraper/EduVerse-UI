import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import { Users, GraduationCap, Calendar, Code, ChevronDown, ChevronUp, MessageCircle, MessageSquare, Activity, BarChart3, TrendingUp, Star, BarChart2 } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

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
  const [showChart, setShowChart] = useState(true) // 차트/별점 토글 상태 - 기본값: 차트 보기

  // 점수를 별점으로 변환하는 컴포넌트
  const StarRating = ({ score }: { score: number }) => {
    const totalStars = 5
    const rating = score / 20 // 100점 만점을 5점 만점으로 변환
    const fullStars = Math.floor(rating)
    const partialFill = rating - fullStars // 0.0 ~ 0.9 사이의 값

    return (
      <div className="relative group flex items-center gap-1">
        {/* 별점 아이콘 */}
        <div className="flex gap-0.5">
          {[...Array(totalStars)].map((_, index) => {
            if (index < fullStars) {
              // 완전히 채워진 별
              return <Star key={index} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            }
            if (index === fullStars && partialFill > 0) {
              // 부분적으로 채워진 별 (0.1 단위)
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
            // 빈 별
            return <Star key={index} className="w-4 h-4 text-gray-400 fill-gray-400" />
          })}
        </div>
        {/* 툴팁 */}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
          currentTheme === 'dark'
            ? 'bg-gray-900 text-white border border-gray-700'
            : 'bg-gray-800 text-white'
        }`}>
          {rating.toFixed(1)} / 5점
        </div>
      </div>
    )
  }

  // 레이더 차트 컴포넌트
  const GrowthRadarChart = () => {
    // 차트 데이터 준비 (100점 만점을 5점 만점으로 변환)
    const chartData = [
      {
        subject: '누적평균',
        value: (averageScore || 0) / 20, // 100점 -> 5점 변환
        fullMark: 5,
      },
      {
        subject: '개념이해',
        value: (conceptUnderstanding || 0) / 20, // 100점 -> 5점 변환
        fullMark: 5,
      },
      {
        subject: '코드활용',
        value: (codeApplication || 0) / 20, // 100점 -> 5점 변환
        fullMark: 5,
      },
    ]

    return (
      <div className="w-full h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke={currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280',
                fontSize: 11
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 5]}
              tick={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                padding: '8px 12px'
              }}
              labelStyle={{
                color: currentTheme === 'dark' ? '#f3f4f6' : '#111827',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}
              itemStyle={{
                color: currentTheme === 'dark' ? '#d1d5db' : '#374151'
              }}
              formatter={(value: number) => `${value.toFixed(1)}점`}
            />
            <Radar
              name="성장 기록"
              dataKey="value"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.5}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const completedMissionsCount = lessons.filter(l => l.status === 'completed').length;

  // 나의 활동 - 참석 현황 계산
  const completedAttendance = lessons.filter(l => l.attendance === 'completed').length;
  const incompleteAttendance = lessons.filter(l => l.attendance === 'incomplete').length;
  const absentAttendance = lessons.filter(l => l.attendance === 'absent').length;
  const totalAttendanceRecords = completedAttendance + incompleteAttendance + absentAttendance;

  const completedAttendanceWidth = totalAttendanceRecords > 0 ? (completedAttendance / totalAttendanceRecords) * 100 : 0;
  const incompleteAttendanceWidth = totalAttendanceRecords > 0 ? (incompleteAttendance / totalAttendanceRecords) * 100 : 0;
  const absentAttendanceWidth = totalAttendanceRecords > 0 ? (absentAttendance / totalAttendanceRecords) * 100 : 0;


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
          <div className="space-y-4">
            {/* 참석 현황 - 스택형 프로그레스 바 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  참석 현황
                </span>
              </div>

              {/* 스택형 프로그레스 바 */}
              <div className="relative h-3 rounded-full overflow-hidden bg-gray-700/30 mb-3">
                {(() => {
                  const completed = lessons.filter(l => l.attendance === 'completed').length
                  const incomplete = lessons.filter(l => l.attendance === 'incomplete').length
                  const absent = lessons.filter(l => l.attendance === 'absent').length
                  const total = completed + incomplete + absent

                  if (total === 0) return null

                  const completedPercent = (completed / total) * 100
                  const incompletePercent = (incomplete / total) * 100
                  const absentPercent = (absent / total) * 100

                  return (
                    <>
                      {/* 완료 */}
                      {completed > 0 && (
                        <div
                          className="absolute left-0 h-full bg-green-500 transition-all duration-300 group"
                          style={{ width: `${completedPercent}%` }}
                        >
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${
                            currentTheme === 'dark'
                              ? 'bg-gray-900 text-white border border-gray-700'
                              : 'bg-gray-800 text-white'
                          }`}>
                            완료 {completed}개 ({Math.round(completedPercent)}%)
                          </div>
                        </div>
                      )}
                      {/* 미완료 */}
                      {incomplete > 0 && (
                        <div
                          className="absolute h-full bg-amber-600 transition-all duration-300 group"
                          style={{
                            left: `${completedPercent}%`,
                            width: `${incompletePercent}%`
                          }}
                        >
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${
                            currentTheme === 'dark'
                              ? 'bg-gray-900 text-white border border-gray-700'
                              : 'bg-gray-800 text-white'
                          }`}>
                            미완료 {incomplete}개 ({Math.round(incompletePercent)}%)
                          </div>
                        </div>
                      )}
                      {/* 불참 */}
                      {absent > 0 && (
                        <div
                          className="absolute h-full bg-gray-500 transition-all duration-300 group"
                          style={{
                            left: `${completedPercent + incompletePercent}%`,
                            width: `${absentPercent}%`
                          }}
                        >
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${
                            currentTheme === 'dark'
                              ? 'bg-gray-900 text-white border border-gray-700'
                              : 'bg-gray-800 text-white'
                          }`}>
                            불참 {absent}개 ({Math.round(absentPercent)}%)
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* 범례 */}
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    완료 {lessons.filter(l => l.attendance === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                  <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    미완료 {lessons.filter(l => l.attendance === 'incomplete').length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                  <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    불참 {lessons.filter(l => l.attendance === 'absent').length}
                  </span>
                </div>
              </div>
            </div>

            {/* 질의응답 현황 - 뱃지 스타일 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  질의응답
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/student/qna?filter=pending')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-orange-900/20 hover:bg-orange-900/30 border border-orange-800/50'
                      : 'bg-orange-50 hover:bg-orange-100 border border-orange-200'
                  }`}
                >
                  <MessageCircle className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                  }`}>
                    대기
                  </span>
                  <span className={`text-sm font-bold ${
                    currentTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    {lessons.filter(l => l.qnaStatus === 'question').length}
                  </span>
                </button>
                <button
                  onClick={() => navigate('/student/qna?filter=answered')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/50'
                      : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 ${
                    currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`text-xs ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    완료
                  </span>
                  <span className={`text-sm font-bold ${
                    currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {lessons.filter(l => l.qnaStatus === 'answered').length}
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
          <div className="flex items-center gap-2">
            {/* 차트/별점 토글 버튼 */}
            <button
              onClick={() => setShowChart(!showChart)}
              className={`relative group p-1 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label={showChart ? '별점 보기' : '차트 보기'}
            >
              {showChart ? (
                <Star className="w-4 h-4" />
              ) : (
                <BarChart2 className="w-4 h-4" />
              )}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                currentTheme === 'dark'
                  ? 'bg-gray-900 text-white border border-gray-700'
                  : 'bg-gray-800 text-white'
              }`}>
                {showChart ? '별점 보기' : '차트 보기'}
              </div>
            </button>
            <button
              onClick={() => navigate('/progress')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentTheme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              자세히
            </button>
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

            {/* 차트 또는 별점 표시 */}
            {showChart ? (
              // 레이더 차트 표시
              <GrowthRadarChart />
            ) : (
              // 별점 표시 (기존 방식)
              <>
                {/* 누적 평균 */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    누적 평균
                  </span>
                  {averageScore !== undefined ? <StarRating score={averageScore} /> : <span className="text-sm text-gray-400">N/A</span>}
                </div>

                {/* 개념 이해도 */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    개념 이해도
                  </span>
                  {conceptUnderstanding !== undefined ? <StarRating score={conceptUnderstanding} /> : <span className="text-sm text-gray-400">N/A</span>}
                </div>

                {/* 코드 활용도 */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    코드 활용도
                  </span>
                  {codeApplication !== undefined ? <StarRating score={codeApplication} /> : <span className="text-sm text-gray-400">N/A</span>}
                </div>
              </>
            )}
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
