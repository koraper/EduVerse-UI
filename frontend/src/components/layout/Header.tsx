import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Bell, HelpCircle, ChevronDown, Home, Settings, LogOut, MessageCircle } from 'lucide-react'
import Button from '@/components/common/Button'
import ComingSoonModal from '@/components/common/ComingSoonModal'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { currentTheme, setTheme } = useTheme()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // 프로필 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') {
      return 'bg-purple-100 text-purple-800'
    } else if (role === 'professor') {
      return 'bg-blue-100 text-blue-800'
    } else {
      return 'bg-success-100 text-success-800'
    }
  }

  const getRoleLabel = (role: string) => {
    if (role === 'admin') {
      return '관리자'
    } else if (role === 'professor') {
      return '교수'
    } else {
      return '학생'
    }
  }

  const getDashboardPath = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard'
    } else if (user?.role === 'professor') {
      return '/professor/dashboard'
    } else {
      return '/student/dashboard'
    }
  }

  // 현재 페이지가 설정 페이지, 질의응답 페이지, 성장 일기 페이지인지 확인 (홈 버튼을 표시해야 하는 페이지들)
  const isSettingsPage = location.pathname === '/settings' || location.pathname === '/student/qna' || location.pathname === '/progress'

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-900 border-b border-gray-700'
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <div className="flex items-center">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className={`text-xl font-bold hidden sm:block ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>EduVerse</span>
          </button>
        </div>

        {/* 우측 메뉴 */}
        <div className="flex items-center space-x-4">
          {/* 테마 토글 버튼 */}
          <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'text-yellow-400 hover:bg-gray-800 hover:text-yellow-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="다크/라이트 모드 전환"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>

          {/* 알림 버튼 */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className={`relative p-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="알림"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          {/* 도움말 버튼 */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className={`p-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="도움말"
          >
            <HelpCircle className="w-6 h-6" />
          </button>

          {/* 프로필 메뉴 */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
                <div className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</div>
              </div>
              <ChevronDown className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>

            {/* 프로필 드롭다운 메뉴 */}
            {isProfileMenuOpen && (
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
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{user?.name}</div>
                      <div className={`text-xs truncate ${
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{user?.email}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${user ? getRoleBadgeColor(user.role) : ''}`}>
                        {user ? getRoleLabel(user.role) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 메뉴 항목 */}
                <div className="py-2">
                  {/* 홈/설정 토글 버튼 */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate(isSettingsPage ? getDashboardPath() : '/settings')
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${
                      currentTheme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isSettingsPage ? (
                      <>
                        <Home className="w-5 h-5" />
                        <span>홈</span>
                      </>
                    ) : (
                      <>
                        <Settings className="w-5 h-5" />
                        <span>설정</span>
                      </>
                    )}
                  </button>

                  {/* 학생 전용 - 질의응답 메뉴 (질의응답/성장일기 페이지에서는 숨김) */}
                  {user?.role === 'student' &&
                   location.pathname !== '/student/qna' &&
                   location.pathname !== '/progress' && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        navigate('/student/qna')
                      }}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${
                        currentTheme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>질의응답</span>
                    </button>
                  )}
                </div>

                {/* 로그아웃 */}
                <div className={`border-t pt-2 ${
                  currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={handleLogout}
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

      {/* 알림 준비 중 모달 */}
      <ComingSoonModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        feature="알림"
      />

      {/* 도움말 준비 중 모달 */}
      <ComingSoonModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        feature="도움말"
      />
    </header>
  )
}

export default Header
