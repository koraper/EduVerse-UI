import { useTheme } from '@/contexts/ThemeContext'
import { CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  week: number
  status: 'completed' | 'in_progress' | 'upcoming'
  completedAt?: string
}

interface CurriculumSidebarProps {
  lessons: Lesson[]
  currentLessonId: number
  onLessonSelect: (lessonId: number) => void
  totalLessons: number
  completedLessons: number
}

const CurriculumSidebar = ({
  lessons,
  currentLessonId,
  onLessonSelect,
  totalLessons,
  completedLessons
}: CurriculumSidebarProps) => {
  const { currentTheme } = useTheme()

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

  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  return (
    <aside className={`w-80 border-r overflow-y-auto transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* 학습 통계 */}
      <div className={`p-6 border-b ${
        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className={`text-lg font-bold mb-4 ${
          currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          학습 진행 현황
        </h2>

        {/* 진행률 바 */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              완료율
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
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className={`p-3 rounded-lg ${
            currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              완료 차시
            </p>
            <p className={`text-xl font-bold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {completedLessons}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              전체 차시
            </p>
            <p className={`text-xl font-bold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {totalLessons}
            </p>
          </div>
        </div>
      </div>

      {/* 차시 목록 */}
      <div className="p-4">
        <h3 className={`text-sm font-semibold mb-3 px-2 ${
          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          전체 차시
        </h3>

        <div className="space-y-2">
          {lessons.map((lesson) => {
            const isActive = lesson.id === currentLessonId

            return (
              <button
                key={lesson.id}
                onClick={() => onLessonSelect(lesson.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? currentTheme === 'dark'
                      ? 'bg-primary-900 border-2 border-primary-600'
                      : 'bg-primary-50 border-2 border-primary-600'
                    : currentTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-650 border-2 border-transparent'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 상태 아이콘 */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(lesson.status)}
                  </div>

                  {/* 차시 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {lesson.week}차시
                      </span>
                      {lesson.status === 'in_progress' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          진행중
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium truncate ${
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

                    {/* 완료 시간 */}
                    {lesson.completedAt && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{lesson.completedAt}</span>
                      </div>
                    )}
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
