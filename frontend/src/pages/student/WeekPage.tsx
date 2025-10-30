import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import LearningHeader from '@/components/learning/LearningHeader'
import CurriculumSidebar from '@/components/learning/CurriculumSidebar'
import LearningContent from '@/components/learning/LearningContent'
import CodeEditor from '@/components/learning/CodeEditor'
import ExecutionPanel from '@/components/learning/ExecutionPanel'
import NavigationFooter from '@/components/learning/NavigationFooter'

interface Lesson {
  id: number
  title: string
  week: number
  status: 'completed' | 'in_progress' | 'upcoming'
  completedAt?: string
}

interface CourseData {
  id: number
  name: string
  totalLessons: number
  completedLessons: number
  lessons: Lesson[]
}

const WeekPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { currentTheme } = useTheme()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentLessonId, setCurrentLessonId] = useState<number>(1)
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  // Mock 데이터 (scenario-latest.json 기반)
  const [courseData] = useState<CourseData>({
    id: Number(courseId) || 1,
    name: 'LogiCore Tech 신입 개발자 과정',
    totalLessons: 12,
    completedLessons: 3,
    lessons: [
      { id: 1, title: '첫 코드 작성과 데이터 저장', week: 1, status: 'completed', completedAt: '2025-10-20' },
      { id: 2, title: '데이터 가공하기: 연산자와 문자열', week: 2, status: 'completed', completedAt: '2025-10-22' },
      { id: 3, title: '흐름 제어: 조건과 반복으로 똑똑한 코드 만들기', week: 3, status: 'completed', completedAt: '2025-10-25' },
      { id: 4, title: '코드 재사용의 시작: 함수 정의와 활용', week: 4, status: 'in_progress' },
      { id: 5, title: '자료구조 (1): 순서가 있는 데이터 묶음, 리스트와 튜플', week: 5, status: 'upcoming' },
      { id: 6, title: '자료구조 (2): Key-Value 데이터, 딕셔너리와 집합', week: 6, status: 'upcoming' },
      { id: 7, title: '모듈화 및 중간 점검: 나만의 유틸리티 모듈 만들기', week: 7, status: 'upcoming' },
      { id: 8, title: '객체 지향 프로그래밍 (1): 클래스와 객체의 이해', week: 8, status: 'upcoming' },
      { id: 9, title: '객체 지향 프로그래밍 (2): 상속을 통한 코드 확장', week: 9, status: 'upcoming' },
      { id: 10, title: '파일 처리와 예외 관리: 데이터 영구 저장 및 오류 대응', week: 10, status: 'upcoming' },
      { id: 11, title: '파이썬 생태계 첫걸음: 표준 라이브러리와 외부 패키지', week: 11, status: 'upcoming' },
      { id: 12, title: '최종 프로젝트: 주소록 관리 프로그램 제작', week: 12, status: 'upcoming' },
    ]
  })

  const currentLesson = courseData.lessons.find(l => l.id === currentLessonId)
  const progress = Math.round((courseData.completedLessons / courseData.totalLessons) * 100)

  // 자동 저장 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: API 호출로 코드 저장
      console.log('Auto-saving code...')
    }, 2000)

    return () => clearTimeout(timer)
  }, [code])

  const handleLessonChange = (lessonId: number) => {
    setCurrentLessonId(lessonId)
    // TODO: 해당 차시의 코드 불러오기
    setCode('')
    setConsoleOutput('')
    setTestResults([])
  }

  const handleRunCode = async () => {
    setIsExecuting(true)
    setConsoleOutput('코드를 실행 중입니다...')

    // TODO: Piston API 연동
    setTimeout(() => {
      setConsoleOutput('Hello, World!\n실행 완료 (0.23초)')
      setIsExecuting(false)
    }, 1000)
  }

  const handleRunTests = async () => {
    setIsExecuting(true)

    // TODO: 테스트 실행 API 연동
    setTimeout(() => {
      setTestResults([
        { id: 1, name: '기본 입력 테스트', status: 'pass', expected: '5', actual: '5' },
        { id: 2, name: '경계값 테스트', status: 'pass', expected: '0', actual: '0' },
        { id: 3, name: '음수 입력 테스트', status: 'fail', expected: '-5', actual: '0' },
      ])
      setIsExecuting(false)
    }, 1500)
  }

  const handleGoBack = () => {
    navigate('/student/dashboard')
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <LearningHeader
        courseName={courseData.name}
        lessonTitle={currentLesson?.title || ''}
        lessonWeek={currentLesson?.week || 0}
        progress={progress}
        onGoBack={handleGoBack}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <CurriculumSidebar
            lessons={courseData.lessons}
            currentLessonId={currentLessonId}
            onLessonSelect={handleLessonChange}
            totalLessons={courseData.totalLessons}
            completedLessons={courseData.completedLessons}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 relative ${
          currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {/* 수첩 배경 효과 */}
          <div className={`absolute inset-0 pointer-events-none ${
            currentTheme === 'dark' ? 'opacity-5' : 'opacity-10'
          }`}
            style={{
              backgroundImage: `
                linear-gradient(transparent 0px, transparent 39px, ${currentTheme === 'dark' ? '#60A5FA' : '#93C5FD'} 39px, ${currentTheme === 'dark' ? '#60A5FA' : '#93C5FD'} 40px),
                linear-gradient(90deg, ${currentTheme === 'dark' ? '#EF4444' : '#F87171'} 0px, transparent 1px)
              `,
              backgroundSize: '100% 40px, 80px 100%',
              backgroundPosition: '0 0, 40px 0'
            }}
          />
          <div className="container mx-auto p-6 space-y-6 relative z-10">
            {/* Learning Content Section */}
            <LearningContent
              lessonTitle={currentLesson?.title || ''}
              lessonWeek={currentLesson?.week || 0}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
            />

            {/* Code Editor */}
            <CodeEditor
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
            />

            {/* Execution Panel */}
            <ExecutionPanel
              consoleOutput={consoleOutput}
              testResults={testResults}
              isExecuting={isExecuting}
              onRunCode={handleRunCode}
              onRunTests={handleRunTests}
            />

            {/* Navigation Footer */}
            <NavigationFooter
              currentLessonId={currentLessonId}
              totalLessons={courseData.totalLessons}
              isCompleted={testResults.every(t => t.status === 'pass')}
              onPrevious={() => currentLessonId > 1 && handleLessonChange(currentLessonId - 1)}
              onNext={() => currentLessonId < courseData.totalLessons && handleLessonChange(currentLessonId + 1)}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default WeekPage
