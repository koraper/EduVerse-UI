import LandingHeader from './LandingHeader'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import CTASection from './CTASection'
import ContactSection from './ContactSection'
import Footer from '@/components/layout/Footer'

const LandingPage = () => {
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
