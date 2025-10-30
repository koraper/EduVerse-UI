import { useTheme } from '@/contexts/ThemeContext'
import { Target, BookOpen, Lightbulb } from 'lucide-react'
import { Card } from '@/components/common'

interface LearningContentProps {
  lessonTitle: string
  lessonWeek: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  onDifficultyChange: (difficulty: 'basic' | 'intermediate' | 'advanced') => void
}

const LearningContent_Toggle = ({
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

  const difficultyOptions = [
    { level: 'basic' as const, label: '기초', emoji: '🟢' },
    { level: 'intermediate' as const, label: '중급', emoji: '🟡' },
    { level: 'advanced' as const, label: '심화', emoji: '🔴' }
  ]

  // 나중에 사용할 수 있도록 주석 처리
  // const getDifficultyIndex = (level: string) => {
  //   switch (level) {
  //     case 'basic': return 0
  //     case 'intermediate': return 1
  //     case 'advanced': return 2
  //     default: return 0
  //   }
  // }

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

        {/* 난이도 선택 - 토글 스위치 방식 */}
        <div>
          <h4 className={`text-sm font-semibold mb-4 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            난이도 선택
          </h4>

          <div className="flex justify-center">
            <div className={`inline-flex p-1.5 rounded-xl ${
              currentTheme === 'dark'
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-gray-100 border border-gray-200'
            }`}>
              {difficultyOptions.map((option) => {
                const isSelected = difficulty === option.level

                return (
                  <button
                    key={option.level}
                    onClick={() => onDifficultyChange(option.level)}
                    className={`relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 min-w-[120px] ${
                      isSelected
                        ? option.level === 'basic'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : option.level === 'intermediate'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : currentTheme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg ${isSelected ? 'scale-110' : 'scale-100'} transition-transform`}>
                        {option.emoji}
                      </span>
                      <span>{option.label}</span>
                    </div>

                    {/* 선택 인디케이터 */}
                    {isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <p className={`text-xs mt-3 text-center ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            원하는 난이도를 클릭하여 선택하세요
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LearningContent_Toggle
