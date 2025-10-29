import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/common'

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

  return (
    <Card>
      <div className="p-6">
        <div className="text-center">
          <p className={`text-sm ${
            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {/* 여기에 추가 콘텐츠를 넣을 수 있습니다 */}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default NavigationFooter
