import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import { CheckCircle2, Circle, PlayCircle, ArrowUpDown, MessageCircle, MessageSquare } from 'lucide-react'

type LessonFilter = 'all' | 'in_progress' | 'completed' | 'upcoming'

interface Lesson {
  id: number
  title: string
  week: number
  status: 'completed' | 'in_progress' | 'upcoming'
  completedAt?: string
  classDate?: string
  attendance?: 'completed' | 'incomplete' | 'absent'
  qnaStatus?: 'none' | 'question' | 'answered'
}

interface LessonListProps {
  lessons: Lesson[]
  currentLessonId: number
  onLessonSelect: (lessonId: number) => void
}

const LessonList = ({ lessons, currentLessonId, onLessonSelect }: LessonListProps) => {
  const navigate = useNavigate()
  const { currentTheme } = useTheme()
  const [activeFilter, setActiveFilter] = useState<LessonFilter>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <PlayCircle className={`w-5 h-5 ${
          currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`} />
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

  const getQnaIcon = (qnaStatus?: 'none' | 'question' | 'answered', lessonId?: number) => {
    if (!qnaStatus || qnaStatus === 'none') return null

    const handleQnaClick = (e: React.MouseEvent) => {
      e.stopPropagation() // 카드 클릭 이벤트 방지
      const filter = qnaStatus === 'question' ? 'pending' : 'answered'
      navigate(`/student/qna?filter=${filter}&lesson=${lessonId}`)
    }

    switch (qnaStatus) {
      case 'question':
        return (
          <button
            onClick={handleQnaClick}
            className="relative group"
          >
            <MessageCircle className={`w-4 h-4 transition-transform hover:scale-110 ${
              currentTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`} />
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
              currentTheme === 'dark'
                ? 'bg-gray-900 text-white border border-gray-700'
                : 'bg-gray-800 text-white'
            }`}>
              질의 있음
            </div>
          </button>
        )
      case 'answered':
        return (
          <button
            onClick={handleQnaClick}
            className="relative group"
          >
            <MessageSquare className={`w-4 h-4 transition-transform hover:scale-110 ${
              currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
              currentTheme === 'dark'
                ? 'bg-gray-900 text-white border border-gray-700'
                : 'bg-gray-800 text-white'
            }`}>
              응답 완료
            </div>
          </button>
        )
      default:
        return null
    }
  }

  // 필터링 및 정렬된 차시 목록
  const filteredLessons = lessons
    .filter((lesson) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'completed') return lesson.status === 'completed'
      if (activeFilter === 'in_progress') return lesson.status === 'in_progress'
      if (activeFilter === 'upcoming') return lesson.status === 'upcoming'
      return true
    })
    .sort((a, b) => {
      return sortOrder === 'asc' ? a.week - b.week : b.week - a.week
    })

  // 필터 버튼의 클래스를 결정하는 헬퍼 함수
  const getFilterButtonClasses = (filterType: LessonFilter, filterColor: string) => {
    const isActive = activeFilter === filterType
    const isDark = currentTheme === 'dark'

    const baseClasses = 'px-3 py-1.5 text-xs font-medium rounded-md transition-all'

    if (isActive) {
      const activeColorClasses = {
        primary: isDark ? 'bg-primary-600' : 'bg-primary-500',
        blue: isDark ? 'bg-blue-600' : 'bg-blue-500',
        gray: isDark ? 'bg-gray-600' : 'bg-gray-500',
        green: isDark ? 'bg-green-600' : 'bg-green-500',
      }[filterColor] || (isDark ? 'bg-primary-600' : 'bg-primary-500')

      return `${baseClasses} ${activeColorClasses} text-white shadow-md`
    } else {
      const inactiveClasses = isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
      return `${baseClasses} ${inactiveClasses}`
    }
  }

  return (
    <aside className={`w-80 border-l flex flex-col transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* 필터 및 정렬 */}
      <div className={`p-4 border-b ${
        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className={`inline-flex p-1 rounded-lg flex-1 ${
            currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setActiveFilter('all')}
              className={`${getFilterButtonClasses('all', 'primary')} flex-1`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`${getFilterButtonClasses('in_progress', 'blue')} flex-1`}
            >
              수업 중
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`${getFilterButtonClasses('completed', 'green')} flex-1`}
            >
              참여
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`${getFilterButtonClasses('upcoming', 'gray')} flex-1`}
            >
              잔여
            </button>
          </div>

          {/* 정렬 버튼 */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'bg-gray-900 hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 차시 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
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
                      <div className="flex items-center gap-2">
                        {getQnaIcon(lesson.qnaStatus, lesson.id)}
                        {lesson.classDate && lesson.status !== 'upcoming' && (
                          <span className={`text-xs ${
                            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {lesson.classDate}
                          </span>
                        )}
                      </div>
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

export default LessonList
