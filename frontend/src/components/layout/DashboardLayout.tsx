import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useTheme } from '@/contexts/ThemeContext'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { currentTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  // localStorage에서 사이드바 상태 불러오기
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen')
    return saved !== null ? saved === 'true' : true
  })

  // 사이드바 상태 변경 시 localStorage에 저장
  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    localStorage.setItem('sidebarOpen', String(newState))
  }

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 모바일에서 사이드바 열렸을 때 스크롤 방지
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isSidebarOpen])

  return (
    <div className={`min-h-screen min-w-[1280px] flex flex-col ${
      currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Header />

      <div className="flex flex-1 relative">
        {/* 데스크톱 사이드바 - 화면에 고정 */}
        {!isMobile && isSidebarOpen && (
          <div className={`fixed left-0 top-[64px] bottom-0 w-64 border-r flex flex-col z-20 overflow-y-auto ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <Sidebar />
          </div>
        )}

        {/* 데스크톱에서 사이드바 공간 확보 */}
        {!isMobile && isSidebarOpen && <div className="w-64 flex-shrink-0" />}

        {/* 모바일 사이드바 오버레이 */}
        {isMobile && isSidebarOpen && (
          <>
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={handleToggleSidebar}
            />

            {/* 사이드바 */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
              currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Sidebar />
            </div>
          </>
        )}

        {/* 사이드바 토글 버튼 - 화면에 고정 */}
        <button
          onClick={handleToggleSidebar}
          className={`fixed top-[106px] ${isSidebarOpen ? 'left-64' : 'left-0'} -translate-x-1/2 z-30 p-2 border rounded-full shadow-md transition-all duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-gray-400 hover:text-primary-400 hover:border-primary-500'
              : 'bg-white border-gray-300 text-gray-600 hover:text-primary-600 hover:border-primary-500'
          }`}
          title={isSidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
        >
          {isSidebarOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col overflow-x-hidden">
          {/* 페이지 컨텐츠 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
