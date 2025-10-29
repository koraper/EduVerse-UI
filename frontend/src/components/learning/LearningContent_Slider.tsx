import { useTheme } from '@/contexts/ThemeContext'
import { Target, BookOpen, Lightbulb } from 'lucide-react'
import { Card } from '@/components/common'

interface LearningContentProps {
  lessonTitle: string
  lessonWeek: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  onDifficultyChange: (difficulty: 'basic' | 'intermediate' | 'advanced') => void
  lessonStatus?: 'completed' | 'in_progress' | 'upcoming'
}

const LearningContent_Slider = ({
  lessonTitle,
  lessonWeek,
  difficulty,
  onDifficultyChange,
  lessonStatus = 'in_progress'
}: LearningContentProps) => {
  const { currentTheme } = useTheme()

  // Mock 데이터 (추후 API로 대체)
  const learningGoalsBasic = [
    '리스트와 튜플의 기본 개념을 이해한다',
    '간단한 리스트 생성과 접근 방법을 익힌다',
    '기초적인 인덱싱 방법을 학습한다',
    '리스트에 요소를 추가하고 제거하는 방법을 익힌다',
    '간단한 반복문을 사용하여 리스트를 순회한다'
  ]

  const learningGoalsIntermediate = [
    '리스트와 튜플의 차이점과 활용 시나리오를 분석한다',
    '다양한 메서드와 슬라이싱 기법을 마스터한다',
    '복잡한 데이터 구조 조작 및 성능 최적화를 수행한다',
    '리스트 컴프리헨션을 활용한 효율적인 데이터 처리를 구현한다',
    '중첩 리스트와 다차원 데이터 구조를 다루는 고급 기법을 습득한다'
  ]

  const learningGoals = difficulty === 'basic' ? learningGoalsBasic : learningGoalsIntermediate

  const conceptText = `리스트(List)는 Python에서 가장 많이 사용되는 자료구조 중 하나입니다. 리스트는 여러 개의 값을 하나의 변수에 저장할 수 있으며, 각 값은 인덱스를 통해 접근할 수 있습니다. 리스트는 대괄호 []를 사용하여 생성하며, 다양한 타입의 데이터를 함께 저장할 수 있습니다.`

  // 마침표 뒤에 줄바꿈 추가
  const concept = conceptText.split('. ').filter(s => s.trim()).map((sentence, index, array) =>
    index < array.length - 1 ? sentence + '.' : sentence
  )

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
          <div className="flex items-center gap-3 mb-6">
            <Target className={`w-5 h-5 ${
              currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`text-lg font-semibold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              학습 목표
            </h3>

            {/* 학습 레벨 설정 */}
            <div className={`relative inline-flex items-center p-0.5 rounded-full ${
              currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              {/* 슬라이딩 배경 */}
              <div
                className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-in-out ${
                  difficulty === 'basic'
                    ? currentTheme === 'dark'
                      ? 'bg-green-600 left-0.5'
                      : 'bg-green-500 left-0.5'
                    : currentTheme === 'dark'
                    ? 'bg-blue-600 left-[50%]'
                    : 'bg-blue-500 left-[50%]'
                }`}
                style={{ width: 'calc(50% - 2px)' }}
              />

              {/* 버튼들 */}
              <button
                onClick={() => onDifficultyChange('basic')}
                className={`relative z-10 px-4 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                  difficulty === 'basic'
                    ? 'text-white'
                    : currentTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                초급자
              </button>
              <button
                onClick={() => onDifficultyChange('intermediate')}
                className={`relative z-10 px-4 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                  difficulty === 'intermediate'
                    ? 'text-white'
                    : currentTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                경험자
              </button>
            </div>
          </div>

          <ul className="space-y-4 ml-4">
            {learningGoals.map((goal, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  difficulty === 'basic'
                    ? currentTheme === 'dark'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-500 text-white'
                    : currentTheme === 'dark'
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'bg-blue-500 text-white'
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
            ? 'bg-blue-900/20 border-yellow-500'
            : 'bg-blue-50 border-yellow-400'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className={`w-4 h-4 ${
              currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h4 className={`text-xs font-semibold ${
              currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'
            }`}>
              핵심 개념
            </h4>
          </div>
          <div className={`text-base leading-loose ${
            currentTheme === 'dark' ? 'text-blue-200' : 'text-blue-800'
          }`}>
            {concept.map((sentence, index) => (
              <p key={index} className="mb-2">
                {sentence}
              </p>
            ))}
          </div>
        </div>

        {/* 수업 참여 버튼 */}
        <div className="flex justify-center pt-6">
          <button
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
              currentTheme === 'dark'
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {lessonStatus === 'completed'
              ? '수업 복습하기'
              : lessonStatus === 'upcoming'
              ? '수업 미리보기'
              : '수업 참여하기'}
          </button>
        </div>
      </div>
    </Card>
  )
}

export default LearningContent_Slider
