import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { FontProvider } from '@/contexts/FontContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider, ToastContainer, ErrorBoundary, Loading } from '@/components/common'

// Lazy load pages
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const StudentSignupPage = lazy(() => import('@/pages/auth/StudentSignupPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage'))
const LearningPage = lazy(() => import('@/pages/student/LearningPage'))
const WeekPage = lazy(() => import('@/pages/student/WeekPage'))
const QnAPage = lazy(() => import('@/pages/student/QnAPage'))
const ProfessorDashboardPage = lazy(() => import('@/pages/professor/ProfessorDashboardPage'))
// Professor ClassManagementPage는 미완성이므로 제외
// const ProfessorClassManagementPage = lazy(() => import('@/pages/professor/ClassManagementPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const CoursesPage = lazy(() => import('@/pages/courses/CoursesPage'))
const CourseDetailPage = lazy(() => import('@/pages/courses/CourseDetailPage'))
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'))
const ClassManagementPage = lazy(() => import('@/pages/admin/ClassManagementPage'))
const AdminLogsPage = lazy(() => import('@/pages/admin/AdminLogsPage'))
const SystemSettingsPage = lazy(() => import('@/pages/admin/SystemSettingsPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'))
const AssignmentsPage = lazy(() => import('@/pages/assignments/AssignmentsPage'))
const ProgressPage = lazy(() => import('@/pages/progress/ProgressPage'))
const GradesPage = lazy(() => import('@/pages/grades/GradesPage'))
const StudentsPage = lazy(() => import('@/pages/students/StudentsPage'))
const CurriculumPage = lazy(() => import('@/pages/curriculum/CurriculumPage'))
const CurriculumManagementPage = lazy(() => import('@/pages/admin/CurriculumManagementPage'))

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // 에러 로깅을 여기서 수행할 수 있습니다
          if (import.meta.env.DEV) {
            console.error('App Error Boundary caught:', error, errorInfo)
          }
        }}
      >
        <ThemeProvider>
          <FontProvider>
            <AuthProvider>
              <ToastProvider>
                <ToastContainer />
                <Suspense fallback={<Loading fullScreen />}>
                  <Routes>
                    {/* 랜딩 페이지 */}
                    <Route path="/" element={<LandingPage />} />

                    {/* 인증 페이지 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/student/signup" element={<StudentSignupPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* 학생 페이지 */}
                    <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                    <Route path="/student/course/:courseId/planner" element={<LearningPage />} />
                    <Route path="/student/course/:courseId/week/:weekId" element={<WeekPage />} />
                    <Route path="/student/qna" element={<QnAPage />} />

                    {/* 교수 페이지 */}
                    <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
                    {/* Professor ClassManagement는 미완성이므로 임시 페이지 */}
                    <Route path="/professor/classes" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">준비 중입니다</h1></div>} />

                    {/* 관리자 페이지 */}
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/users" element={<UserManagementPage />} />
                    <Route path="/admin/classes" element={<ClassManagementPage />} />
                    <Route path="/admin/logs" element={<AdminLogsPage />} />
                    <Route path="/admin/settings" element={<SystemSettingsPage />} />
                    <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                    <Route path="/admin/curricula" element={<CurriculumManagementPage />} />

                    {/* 공통 페이지 */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:id" element={<CourseDetailPage />} />
                    <Route path="/assignments" element={<AssignmentsPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/grades" element={<GradesPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/curriculum" element={<CurriculumPage />} />

                    {/* 404 페이지 */}
                    <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">페이지를 찾을 수 없습니다</h1></div>} />
                  </Routes>
                </Suspense>
              </ToastProvider>
            </AuthProvider>
          </FontProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
