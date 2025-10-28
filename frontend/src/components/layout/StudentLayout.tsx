import type { ReactNode } from 'react'
import Header from './Header'

interface StudentLayoutProps {
  children: ReactNode
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
