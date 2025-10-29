import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Header from './Header'

interface StudentLayoutProps {
  children: ReactNode
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { currentTheme } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
    }`}>
      <Header />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* 페이지 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default StudentLayout
