import { useTheme } from '@/contexts/ThemeContext'
import { ChevronLeft, Menu, X, Sun, Moon } from 'lucide-react'

interface LearningHeaderProps {
  courseName: string
  lessonTitle: string
  lessonWeek: number
  progress: number
  onGoBack: () => void
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

const LearningHeader = ({
  courseName,
  lessonTitle,
  lessonWeek,
  progress,
  onGoBack,
  onToggleSidebar,
  isSidebarOpen
}: LearningHeaderProps) => {
  const { currentTheme, setTheme } = useTheme()

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 border-b ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={onGoBack}
            className={`p-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 사이드바 토글 (모바일) */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition-colors lg:hidden ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="사이드바 토글"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* 과목 정보 */}
          <div className="flex-1 min-w-0">
            <h1 className={`text-lg font-bold truncate ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {courseName}
            </h1>
            <p className={`text-sm truncate ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {lessonWeek}차시: {lessonTitle}
            </p>
          </div>

          {/* 진행도 바 */}
          <div className="hidden md:flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className={`w-full rounded-full h-2 ${
                currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className={`text-sm font-medium whitespace-nowrap ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {progress}%
            </span>
          </div>

          {/* 테마 토글 */}
          <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="테마 전환"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 모바일용 진행도 바 */}
        <div className="md:hidden mt-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className={`w-full rounded-full h-2 ${
                currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-medium ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LearningHeader
