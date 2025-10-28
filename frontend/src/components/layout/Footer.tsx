const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 섹션 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="ml-2 text-xl font-bold text-white">EduVerse</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI 기반 프로그래밍 교육 플랫폼으로 학생과 교수 모두에게
              혁신적인 학습 경험을 제공합니다.
            </p>
          </div>

          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-semibold mb-4">회사 정보</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">상호명:</span> EduVerse
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">대표자:</span> 홍길동
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">사업자등록번호:</span> 123-45-67890
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">주소:</span> 서울특별시 강남구 테헤란로 123
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">이메일:</span> support@eduverse.com
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">전화:</span> 02-1234-5678
              </p>
            </div>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} EduVerse. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                이용약관
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
