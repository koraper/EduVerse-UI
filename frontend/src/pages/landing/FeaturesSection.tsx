import { Card } from '@/components/common'

const FeaturesSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: '실시간 코드 분석',
      description: '학생이 작성한 코드를 실시간으로 분석하여 문법 오류, 로직 오류, 스타일 문제를 즉시 감지합니다.',
      features: ['자동 문법 검사', '코드 품질 분석', '즉각적인 피드백'],
    },
    {
      icon: (
        <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI 기반 학습 지원',
      description: 'GPT 기반 AI가 학생의 질문에 답변하고, 개인화된 학습 가이드를 제공합니다.',
      features: ['24/7 AI 튜터', '맞춤형 학습 경로', '코드 개선 제안'],
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '학습 진도 관리',
      description: '교수는 학생들의 학습 진도를 실시간으로 모니터링하고, 데이터 기반 인사이트를 얻을 수 있습니다.',
      features: ['진도율 대시보드', '성적 통계 분석', '학습 리포트 생성'],
    },
    {
      icon: (
        <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: '효율적인 수업 관리',
      description: '커리큘럼 관리, 과제 제출, 질문 관리까지 한 곳에서 편리하게 운영할 수 있습니다.',
      features: ['커리큘럼 템플릿', '자동 과제 채점', 'Q&A 우선순위 관리'],
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            EduVerse의 주요 기능
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            AI와 데이터 분석을 활용하여 프로그래밍 교육의 새로운 기준을 제시합니다
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-lg hover:border-indigo-500 transition-all hover:transform hover:scale-105"
            >
              <div className="flex flex-col h-full">
                {/* 아이콘 */}
                <div className="mb-4">{feature.icon}</div>

                {/* 제목 */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>

                {/* 설명 */}
                <p className="text-gray-300 mb-4 flex-grow">
                  {feature.description}
                </p>

                {/* 세부 기능 목록 */}
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
