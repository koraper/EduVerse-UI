import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex flex-1 relative">
        {/* 데스크톱 사이드바 - 화면에 고정 */}
        {!isMobile && isSidebarOpen && (
          <div className="fixed left-0 top-[64px] bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-20 overflow-y-auto">
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
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* 사이드바 */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto">
              <Sidebar />
            </div>
          </>
        )}

        {/* 사이드바 토글 버튼 - 화면에 고정 */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-[106px] ${isSidebarOpen ? 'left-64' : 'left-0'} -translate-x-1/2 z-30 p-2 bg-white border border-gray-300 rounded-full shadow-md text-gray-600 hover:text-primary-600 hover:border-primary-500 transition-all duration-300`}
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
