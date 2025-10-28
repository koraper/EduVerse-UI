import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/common'

const LandingHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const isDevelopment = import.meta.env.DEV

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 테스트 계정으로 로그인 페이지 이동
  const handleTestLogin = (role: 'admin' | 'professor' | 'student') => {
    const testAccounts = {
      admin: { email: 'admin@eduverse.com', password: 'password123' },
      professor: { email: 'professor@eduverse.com', password: 'password123' },
      student: { email: 'student@eduverse.com', password: 'password123' },
    }

    navigate('/login', {
      state: {
        testAccount: testAccounts[role]
      }
    })
  }

  // 문의하기 버튼 클릭 핸들러
  const handleContactClick = () => {
    // 현재 랜딩 페이지인 경우 스크롤
    if (location.pathname === '/') {
      const contactSection = document.querySelector('#contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // 다른 페이지인 경우 랜딩 페이지로 이동 후 스크롤
      navigate('/', { state: { scrollTo: 'contact' } })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg border-b border-gray-200'
          : 'bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
              E
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">
              EduVerse
            </span>
          </div>

          {/* 개발 환경 테스트 계정 버튼 */}
          {isDevelopment && (
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-xs text-gray-500 mr-2">개발서버</span>
              <Button
                size="sm"
                onClick={() => handleTestLogin('admin')}
                className="bg-purple-700 text-white hover:bg-purple-800 text-xs py-1 px-3 transition-colors border-0"
              >
                관리자
              </Button>
              <Button
                size="sm"
                onClick={() => handleTestLogin('professor')}
                className="bg-primary-700 text-white hover:bg-primary-800 text-xs py-1 px-3 transition-colors border-0"
              >
                교수
              </Button>
              <Button
                size="sm"
                onClick={() => handleTestLogin('student')}
                className="bg-success-700 text-white hover:bg-success-800 text-xs py-1 px-3 transition-colors border-0"
              >
                학생
              </Button>
            </div>
          )}

          {/* 데스크톱 버튼 */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              로그인
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleContactClick}
              className="bg-primary-600 hover:bg-primary-700"
            >
              문의하기
            </Button>
          </div>

        </div>
      </div>
    </header>
  )
}

export default LandingHeader
