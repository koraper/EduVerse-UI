import { useTheme } from '@/contexts/ThemeContext'
import { Target, BookOpen, Lightbulb, Zap, Flame, Rocket } from 'lucide-react'
import { Card } from '@/components/common'

interface LearningContentProps {
  lessonTitle: string
  lessonWeek: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  onDifficultyChange: (difficulty: 'basic' | 'intermediate' | 'advanced') => void
}

const LearningContent_Card = ({
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
    {
      level: 'basic' as const,
      label: '기초',
      icon: Zap,
      description: '기본 문법과 개념 중심',
      details: '프로그래밍 입문자에게 적합',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      level: 'intermediate' as const,
      label: '중급',
      icon: Flame,
      description: '실전 응용 문제',
      details: '기초를 마친 학습자에게 적합',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      level: 'advanced' as const,
      label: '심화',
      icon: Rocket,
      description: '고급 알고리즘과 최적화',
      details: '실력 향상을 원하는 학습자에게 적합',
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    }
  ]

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

        {/* 난이도 선택 - 카드 방식 */}
        <div>
          <h4 className={`text-sm font-semibold mb-4 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            난이도 선택
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyOptions.map((option) => {
              const Icon = option.icon
              const isSelected = difficulty === option.level

              return (
                <button
                  key={option.level}
                  onClick={() => onDifficultyChange(option.level)}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isSelected
                      ? option.color === 'green'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                        : option.color === 'yellow'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-500/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                      : currentTheme === 'dark'
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* 아이콘과 라벨 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${option.gradient} ${
                      isSelected ? 'scale-110' : 'scale-100 group-hover:scale-105'
                    } transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${
                        isSelected
                          ? option.color === 'green'
                            ? 'text-green-700 dark:text-green-400'
                            : option.color === 'yellow'
                            ? 'text-yellow-700 dark:text-yellow-400'
                            : 'text-red-700 dark:text-red-400'
                          : currentTheme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}>
                        {option.label}
                      </div>
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className={`text-sm font-medium mb-2 ${
                    isSelected
                      ? currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      : currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {option.description}
                  </p>

                  {/* 상세 설명 */}
                  <p className={`text-xs ${
                    isSelected
                      ? currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      : currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {option.details}
                  </p>

                  {/* 선택 표시 */}
                  {isSelected && (
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${
                      option.color === 'green'
                        ? 'bg-green-500'
                        : option.color === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}>
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <p className={`text-xs mt-3 text-center ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            카드를 클릭하여 원하는 난이도를 선택하세요
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LearningContent_Card
