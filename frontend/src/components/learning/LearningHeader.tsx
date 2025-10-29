import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, Menu, X, Sun, Moon, User, LogOut, Home, Settings } from 'lucide-react'

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
  const navigate = useNavigate()
  const location = useLocation()
  const { currentTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)

  // 현재 페이지가 설정 페이지인지 확인
  const isSettingsPage = location.pathname === '/settings'

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 border-b ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 좌측: 페이지 제목 */}
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

            {/* 홈 / 설정 토글 버튼 */}
            <button
              onClick={() => navigate(isSettingsPage ? '/student/dashboard' : '/settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label={isSettingsPage ? '홈으로' : '설정'}
            >
              {isSettingsPage ? (
                <>
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">홈</span>
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">설정</span>
                </>
              )}
            </button>

            {/* 과목 제목 */}
            <div>
              <h1 className={`text-xl font-bold ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {courseName}
              </h1>
              <p className={`text-sm mt-0.5 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {lessonWeek}주차: {lessonTitle}
              </p>
            </div>
          </div>

          {/* 우측: 시간 + 로그인 사용자 정보 */}
          <div className="flex items-center gap-6">
            {/* 시간 표시 */}
            <div className={`hidden md:flex flex-col items-end ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className={`text-xs mt-0.5 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatDate(currentTime)}
              </div>
            </div>

            {/* 구분선 */}
            <div className={`hidden md:block w-px h-12 ${
              currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`} />

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

            {/* 사용자 정보 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentTheme === 'dark' ? 'bg-primary-600' : 'bg-primary-500'
                }`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <div className={`text-sm font-semibold ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || '사용자'}
                  </div>
                  <div className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user?.email || ''}
                  </div>
                </div>
              </button>

              {/* 사용자 메뉴 드롭다운 */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        currentTheme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LearningHeader
