import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { CheckCircle2, Circle, PlayCircle, Clock, Users, Award, GraduationCap, Calendar, Code, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'

type LessonFilter = 'all' | 'in_progress' | 'absent' | 'completed'

interface Lesson {
  id: number
  title: string
  week: number
  status: 'completed' | 'in_progress' | 'upcoming'
  completedAt?: string
  classDate?: string // 수업일
  attendance?: 'completed' | 'incomplete' | 'absent' // 참석 및 과제 완료 여부
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
  currentLessonId: number
  onLessonSelect: (lessonId: number) => void
  totalLessons: number
  completedLessons: number
  courseInfo?: CourseInfo
}

const CurriculumSidebar = ({
  lessons,
  currentLessonId,
  onLessonSelect,
  totalLessons,
  completedLessons,
  courseInfo
}: CurriculumSidebarProps) => {
  const { currentTheme } = useTheme()
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)
  const [activeFilter, setActiveFilter] = useState<LessonFilter>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getAttendanceBadge = (attendance?: 'completed' | 'incomplete' | 'absent') => {
    if (!attendance) return null

    switch (attendance) {
      case 'completed':
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
            currentTheme === 'dark'
              ? 'bg-green-900/30 text-green-400'
              : 'bg-green-100 text-green-700'
          }`}>
            완료
          </span>
        )
      case 'incomplete':
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
            currentTheme === 'dark'
              ? 'bg-yellow-900/30 text-yellow-400'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            미완료
          </span>
        )
      case 'absent':
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
            currentTheme === 'dark'
              ? 'bg-gray-700 text-gray-400'
              : 'bg-gray-200 text-gray-600'
          }`}>
            불참
          </span>
        )
      default:
        return null
    }
  }

  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  // 필터링 및 정렬된 차시 목록
  const filteredLessons = lessons
    .filter((lesson) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'completed') return lesson.status === 'completed'
      if (activeFilter === 'in_progress') return lesson.status === 'in_progress'
      if (activeFilter === 'absent') return lesson.status === 'upcoming' // 불참은 upcoming으로 매핑
      return true
    })
    .sort((a, b) => {
      return sortOrder === 'asc' ? a.week - b.week : b.week - a.week
    })

  // 언어별 배지 색상
  const getLanguageBadgeColor = (language: string) => {
    switch (language) {
      case 'Python':
        return 'bg-blue-600 text-white dark:bg-blue-900/30 dark:text-blue-400'
      case 'Java':
        return 'bg-orange-600 text-white dark:bg-orange-900/30 dark:text-orange-400'
      case 'JavaScript':
        return 'bg-yellow-600 text-white dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-600 text-white dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <aside className={`w-80 border-r overflow-y-auto transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* 학습 정보 */}
      <div className={`p-6 border-b ${
        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
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

      {/* 차시 목록 */}
      <div className="p-4">
        {/* 필터 토글 버튼 및 정렬 */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex p-1 rounded-lg ${
            currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeFilter === 'all'
                ? currentTheme === 'dark'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-primary-500 text-white shadow-md'
                : currentTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveFilter('in_progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeFilter === 'in_progress'
                ? currentTheme === 'dark'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-500 text-white shadow-md'
                : currentTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            수업 중
          </button>
          <button
            onClick={() => setActiveFilter('absent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeFilter === 'absent'
                ? currentTheme === 'dark'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-gray-500 text-white shadow-md'
                : currentTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            불참
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeFilter === 'completed'
                ? currentTheme === 'dark'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-500 text-white shadow-md'
                : currentTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            참여
          </button>
          </div>

          {/* 정렬 버튼 */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`p-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {filteredLessons.map((lesson) => {
            const isActive = lesson.id === currentLessonId

            return (
              <button
                key={lesson.id}
                onClick={() => onLessonSelect(lesson.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  lesson.status === 'in_progress'
                    ? currentTheme === 'dark'
                      ? 'bg-red-900/20 border-2 border-red-600 hover:bg-red-900/30 animate-pulse'
                      : 'bg-red-50 border-2 border-red-400 hover:bg-red-100 shadow-lg shadow-red-200/50'
                    : isActive
                    ? currentTheme === 'dark'
                      ? 'bg-primary-900 border-2 border-primary-600'
                      : 'bg-primary-50 border-2 border-primary-600 shadow-md'
                    : currentTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-650 border-2 border-transparent'
                    : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 상태 아이콘 */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(lesson.status)}
                  </div>

                  {/* 차시 정보 */}
                  <div className="flex-1 min-w-0">
                    {/* 첫 번째 줄: N차시 + 수업일 */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {lesson.week}차시
                        </span>
                        {lesson.status === 'in_progress' && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            currentTheme === 'dark'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            수업 중
                          </span>
                        )}
                      </div>
                      {lesson.classDate && lesson.status !== 'upcoming' && (
                        <span className={`text-xs ${
                          currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {lesson.classDate}
                        </span>
                      )}
                    </div>

                    {/* 두 번째 줄: 차시 제목 + 참석/과제 완료 여부 */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate flex-1 ${
                        isActive
                          ? currentTheme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                          : currentTheme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}>
                        {lesson.title}
                      </p>
                      <div className="flex-shrink-0">
                        {getAttendanceBadge(lesson.attendance)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default CurriculumSidebar
