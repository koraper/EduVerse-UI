import { useTheme } from '@/contexts/ThemeContext'
import { Target, BookOpen, Lightbulb } from 'lucide-react'
import { Card } from '@/components/common'

interface LearningContentProps {
  lessonTitle: string
  lessonWeek: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  onDifficultyChange: (difficulty: 'basic' | 'intermediate' | 'advanced') => void
}

const LearningContent_Slider = ({
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

  const getDifficultyValue = (level: string) => {
    switch (level) {
      case 'basic': return 0
      case 'intermediate': return 1
      case 'advanced': return 2
      default: return 0
    }
  }

  const getDifficultyFromValue = (value: number): 'basic' | 'intermediate' | 'advanced' => {
    switch (value) {
      case 0: return 'basic'
      case 1: return 'intermediate'
      case 2: return 'advanced'
      default: return 'basic'
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'basic': return '기초'
      case 'intermediate': return '중급'
      case 'advanced': return '심화'
      default: return '기초'
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'basic': return 'from-green-500 to-green-600'
      case 'intermediate': return 'from-yellow-500 to-yellow-600'
      case 'advanced': return 'from-red-500 to-red-600'
      default: return 'from-green-500 to-green-600'
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    onDifficultyChange(getDifficultyFromValue(value))
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

        {/* 난이도 선택 - 슬라이더 방식 */}
        <div>
          <h4 className={`text-sm font-semibold mb-4 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            난이도 선택
          </h4>

          <div className="px-2">
            {/* 슬라이더 */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={getDifficultyValue(difficulty)}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right,
                    #22c55e 0%, #22c55e 33.33%,
                    #eab308 33.33%, #eab308 66.66%,
                    #ef4444 66.66%, #ef4444 100%)`
                }}
              />

              {/* 슬라이더 마커 */}
              <div className="absolute -top-1 left-0 right-0 flex justify-between px-0.5 pointer-events-none">
                {[0, 1, 2].map((value) => (
                  <div
                    key={value}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      getDifficultyValue(difficulty) === value
                        ? `bg-gradient-to-r ${getDifficultyColor(getDifficultyFromValue(value))} border-white scale-125 shadow-lg`
                        : currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-300 border-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 라벨 */}
            <div className="flex justify-between mt-3 px-0.5">
              {(['basic', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onDifficultyChange(level)}
                  className={`text-sm font-medium transition-all ${
                    difficulty === level
                      ? level === 'basic'
                        ? 'text-green-600 dark:text-green-400 scale-110'
                        : level === 'intermediate'
                        ? 'text-yellow-600 dark:text-yellow-400 scale-110'
                        : 'text-red-600 dark:text-red-400 scale-110'
                      : currentTheme === 'dark'
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {getDifficultyLabel(level)}
                </button>
              ))}
            </div>
          </div>

          <p className={`text-xs mt-3 text-center ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            슬라이더를 움직여 난이도를 선택하세요
          </p>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Card>
  )
}

export default LearningContent_Slider
