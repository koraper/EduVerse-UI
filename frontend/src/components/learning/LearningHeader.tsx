import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, Menu, X, Sun, Moon, ChevronDown, LogOut, Home } from 'lucide-react'

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
  const { courseId } = useParams<{ courseId: string }>()
  const { currentTheme, setTheme } = useTheme()
  const { user, logout, token } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 사용자 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

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

            {/* 과목 정보 */}
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
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name}
                  </div>
                  <div className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email}
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </button>

              {/* 사용자 메뉴 드롭다운 */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border py-2 ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  {/* 사용자 정보 */}
                  <div className={`px-4 py-3 border-b ${
                    currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{user?.name}</div>
                        <div className={`text-xs truncate ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{user?.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success-100 text-success-800">
                          학생
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 메뉴 항목 */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/student/dashboard')
                      }}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${
                        currentTheme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Home className="w-5 h-5" />
                      <span>홈</span>
                    </button>
                  </div>

                  {/* 로그아웃 */}
                  <div className={`border-t pt-2 ${
                    currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <button
                      onClick={() => {
                        logout()
                        navigate('/login')
                      }}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${
                        currentTheme === 'dark'
                          ? 'text-error-400 hover:bg-error-900/20'
                          : 'text-error-600 hover:bg-error-50'
                      }`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>로그아웃</span>
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
