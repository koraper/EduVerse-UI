import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import LearningHeader from '@/components/learning/LearningHeader'
import CurriculumSidebar from '@/components/learning/CurriculumSidebar'
import LearningContent_Slider from '@/components/learning/LearningContent_Slider'
import LearningContent_Card from '@/components/learning/LearningContent_Card'
import LearningContent_Toggle from '@/components/learning/LearningContent_Toggle'

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

const LearningPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { currentTheme } = useTheme()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentLessonId, setCurrentLessonId] = useState<number>(1)
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic')

  // 난이도 UI 방식 선택: 'slider' | 'card' | 'toggle'
  // 아래 값을 변경하여 3가지 방식을 테스트할 수 있습니다
  // 'slider' - 슬라이더 방식
  // 'card' - 카드 선택 방식
  // 'toggle' - 토글 스위치 방식
  const [uiStyle] = useState<'slider' | 'card' | 'toggle'>('slider')

  // Mock 데이터 (추후 API로 대체)
  const [courseData] = useState<CourseData>({
    id: Number(courseId) || 1,
    name: 'Python 기초 프로그래밍',
    totalLessons: 12,
    completedLessons: 3,
    lessons: [
      { id: 1, title: '변수와 자료형', week: 1, status: 'completed', completedAt: '2025-10-20' },
      { id: 2, title: '조건문과 반복문', week: 2, status: 'completed', completedAt: '2025-10-22' },
      { id: 3, title: '함수의 이해', week: 3, status: 'completed', completedAt: '2025-10-25' },
      { id: 4, title: '리스트와 튜플', week: 4, status: 'in_progress' },
      { id: 5, title: '딕셔너리와 집합', week: 5, status: 'upcoming' },
      { id: 6, title: '문자열 처리', week: 6, status: 'upcoming' },
      { id: 7, title: '파일 입출력', week: 7, status: 'upcoming' },
      { id: 8, title: '예외 처리', week: 8, status: 'upcoming' },
      { id: 9, title: '모듈과 패키지', week: 9, status: 'upcoming' },
      { id: 10, title: '클래스와 객체', week: 10, status: 'upcoming' },
      { id: 11, title: '상속과 다형성', week: 11, status: 'upcoming' },
      { id: 12, title: '종합 프로젝트', week: 12, status: 'upcoming' },
    ]
  })

  // Mock 수업 정보 (추후 API로 대체)
  const courseInfo = {
    professor: '김철수 교수',
    department: '컴퓨터공학과',
    language: 'Python',
    semester: '2025-1학기',
    participationRate: 95,
    assignmentSuccessRate: 88
  }

  const currentLesson = courseData.lessons.find(l => l.id === currentLessonId)
  const progress = Math.round((courseData.completedLessons / courseData.totalLessons) * 100)

  const handleLessonChange = (lessonId: number) => {
    setCurrentLessonId(lessonId)
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
            courseInfo={courseInfo}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto transition-all duration-300 relative">
          {/* 그라디언트 배경 */}
          <div className={`absolute inset-0 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
              : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
          }`} />
          <div className="container mx-auto p-6 space-y-6 relative z-10">
            {/* Learning Content Section - 3가지 UI 방식 */}
            {uiStyle === 'slider' && (
              <LearningContent_Slider
                lessonTitle={currentLesson?.title || ''}
                lessonWeek={currentLesson?.week || 0}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
              />
            )}
            {uiStyle === 'card' && (
              <LearningContent_Card
                lessonTitle={currentLesson?.title || ''}
                lessonWeek={currentLesson?.week || 0}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
              />
            )}
            {uiStyle === 'toggle' && (
              <LearningContent_Toggle
                lessonTitle={currentLesson?.title || ''}
                lessonWeek={currentLesson?.week || 0}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default LearningPage
