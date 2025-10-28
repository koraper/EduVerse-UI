import { Button } from '@/components/common'
import { useNavigate } from 'react-router-dom'

const CTASection = () => {
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* 왼쪽: 텍스트 콘텐츠 */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                EduVerse와 함께 프로그래밍 교육의 혁신을 경험해보세요.
                무료로 시작할 수 있으며, 언제든 업그레이드 가능합니다.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">신용카드 불필요</h4>
                    <p className="text-gray-400">무료 플랜으로 시작하고, 필요할 때 업그레이드하세요</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">5분만에 설정 완료</h4>
                    <p className="text-gray-400">간단한 회원가입으로 바로 수업을 시작할 수 있습니다</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">24/7 고객 지원</h4>
                    <p className="text-gray-400">언제든지 문의하실 수 있는 지원팀이 대기 중입니다</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => {
                    const contactSection = document.querySelector('#contact')
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                >
                  문의하기
                </Button>
              </div>
            </div>

            {/* 오른쪽: 통계/수치 */}
            <div className="bg-gray-700 p-8 lg:p-12 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-400 mb-2">500+</div>
                  <div className="text-gray-300">활성 사용자</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-400 mb-2">1,000+</div>
                  <div className="text-gray-300">완료된 과제</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-400 mb-2">95%</div>
                  <div className="text-gray-300">만족도</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-400 mb-2">24/7</div>
                  <div className="text-gray-300">AI 지원</div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-600">
                <p className="text-gray-300 italic">
                  "EduVerse 덕분에 학생들의 코딩 실력이 눈에 띄게 향상되었습니다.
                  실시간 피드백과 AI 지원이 정말 훌륭합니다!"
                </p>
                <div className="mt-4 flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    김
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-white">김교수</div>
                    <div className="text-sm text-gray-400">컴퓨터공학과 교수</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
