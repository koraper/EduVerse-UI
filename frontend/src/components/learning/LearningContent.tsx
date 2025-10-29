import { useTheme } from '@/contexts/ThemeContext'
import { Target, BookOpen, Lightbulb } from 'lucide-react'
import { Card } from '@/components/common'

interface LearningContentProps {
  lessonTitle: string
  lessonWeek: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  onDifficultyChange: (difficulty: 'basic' | 'intermediate' | 'advanced') => void
}

const LearningContent = ({
  lessonTitle,
  lessonWeek,
  difficulty,
  onDifficultyChange
}: LearningContentProps) => {
  const { currentTheme } = useTheme()

  // Mock 데이터 (추후 API로 대체)
  const learningGoals = [
    '리스트와 튜플의 차이점을 이해한다',
    '리스트의 다양한 메서드를 활용할 수 있다',
    '인덱싱과 슬라이싱을 통해 데이터를 조작할 수 있다'
  ]

  const concept = `리스트(List)는 Python에서 가장 많이 사용되는 자료구조 중 하나입니다.
리스트는 여러 개의 값을 하나의 변수에 저장할 수 있으며, 각 값은 인덱스를 통해 접근할 수 있습니다.
리스트는 대괄호 []를 사용하여 생성하며, 다양한 타입의 데이터를 함께 저장할 수 있습니다.`

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'basic':
        return '기초'
      case 'intermediate':
        return '중급'
      case 'advanced':
        return '심화'
      default:
        return '기초'
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-green-100 text-green-700 border-green-300'
    }
  }

  return (
    <Card>
      <div className="p-6 space-y-6">
        {/* 차시 제목 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className={`w-5 h-5 ${
              currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600'
            }`} />
            <span className={`text-sm font-medium ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {lessonWeek}차시
            </span>
          </div>
          <h2 className={`text-2xl font-bold ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {lessonTitle}
          </h2>
        </div>

        {/* 학습 목표 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className={`w-5 h-5 ${
              currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`text-lg font-semibold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              학습 목표
            </h3>
          </div>
          <ul className="space-y-2">
            {learningGoals.map((goal, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentTheme === 'dark'
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {index + 1}
                </span>
                <span className={`text-sm ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {goal}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 개념 설명 */}
        <div className={`p-4 rounded-lg border ${
          currentTheme === 'dark'
            ? 'bg-blue-900/20 border-blue-800'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className={`w-5 h-5 ${
              currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h4 className={`font-semibold ${
              currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'
            }`}>
              핵심 개념
            </h4>
          </div>
          <p className={`text-sm leading-relaxed ${
            currentTheme === 'dark' ? 'text-blue-200' : 'text-blue-800'
          }`}>
            {concept}
          </p>
        </div>

        {/* 난이도 선택 */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            난이도 선택
          </h4>
          <div className="flex gap-3">
            {(['basic', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                  difficulty === level
                    ? getDifficultyColor(level)
                    : currentTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-650'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {getDifficultyLabel(level)}
              </button>
            ))}
          </div>
          <p className={`text-xs mt-2 ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            난이도를 선택하면 시작 코드와 테스트 케이스가 변경됩니다
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LearningContent
