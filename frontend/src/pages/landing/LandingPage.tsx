import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import LandingHeader from './LandingHeader'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import CTASection from './CTASection'
import ContactSection from './ContactSection'
import Footer from '@/components/layout/Footer'

const LandingPage = () => {
  const location = useLocation()

  useEffect(() => {
    // state에서 scrollTo 값이 있으면 해당 섹션으로 스크롤
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo)
      if (element) {
        // 약간의 딜레이를 주어 페이지가 완전히 로드된 후 스크롤
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      // state 정리 (뒤로가기 시 재스크롤 방지)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  return (
    <div className="min-h-screen bg-gray-900 font-pretendard">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </div>
  )
}

export default LandingPage
