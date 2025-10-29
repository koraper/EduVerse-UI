import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/common'
import { ChevronLeft, ChevronRight, Lightbulb, MessageCircle } from 'lucide-react'

interface NavigationFooterProps {
  currentLessonId: number
  totalLessons: number
  isCompleted: boolean
  onPrevious: () => void
  onNext: () => void
}

const NavigationFooter = ({
  currentLessonId,
  totalLessons,
  isCompleted,
  onPrevious,
  onNext
}: NavigationFooterProps) => {
  const { currentTheme } = useTheme()

  const hasPrevious = currentLessonId > 1
  const hasNext = currentLessonId < totalLessons

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* 왼쪽: 힌트 & 질문 버튼 */}
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                currentTheme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 border border-yellow-800'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              힌트 보기
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                currentTheme === 'dark'
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-800'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              교수님께 질문하기
            </button>
          </div>

          {/* 오른쪽: 네비게이션 버튼 */}
          <div className="flex items-center gap-2">
            {/* 이전 버튼 */}
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                hasPrevious
                  ? currentTheme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-650'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              이전 차시
            </button>

            {/* 다음 버튼 */}
            <button
              onClick={onNext}
              disabled={!hasNext || !isCompleted}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                hasNext && isCompleted
                  ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
                  : hasNext && !isCompleted
                  ? currentTheme === 'dark'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!isCompleted ? '모든 테스트를 통과해야 다음 차시로 이동할 수 있습니다' : ''}
            >
              {isCompleted ? '완료 및 다음' : '다음 차시'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 진행 상태 표시 */}
        <div className={`mt-4 pt-4 border-t ${
          currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {currentLessonId} / {totalLessons} 차시
            </span>
            {!isCompleted && (
              <span className={`flex items-center gap-2 ${
                currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                모든 테스트를 통과하면 다음 차시로 이동할 수 있습니다
              </span>
            )}
            {isCompleted && (
              <span className={`flex items-center gap-2 ${
                currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                테스트 통과! 다음 차시로 이동할 수 있습니다
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default NavigationFooter
