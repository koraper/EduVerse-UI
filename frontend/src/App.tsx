import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { FontProvider } from '@/contexts/FontContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider, ToastContainer, ErrorBoundary } from '@/components/common'
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import StudentSignupPage from '@/pages/auth/StudentSignupPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import StudentDashboardPage from '@/pages/student/StudentDashboardPage'
import ProfessorDashboardPage from '@/pages/professor/ProfessorDashboardPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import SettingsPage from '@/pages/settings/SettingsPage'
import CoursesPage from '@/pages/courses/CoursesPage'
import CourseDetailPage from '@/pages/courses/CourseDetailPage'
import UserManagementPage from '@/pages/admin/UserManagementPage'
import ClassManagementPage from '@/pages/admin/ClassManagementPage'
import AdminLogsPage from '@/pages/admin/AdminLogsPage'
import SystemSettingsPage from '@/pages/admin/SystemSettingsPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AssignmentsPage from '@/pages/assignments/AssignmentsPage'
import ProgressPage from '@/pages/progress/ProgressPage'
import GradesPage from '@/pages/grades/GradesPage'
import StudentsPage from '@/pages/students/StudentsPage'
import CurriculumPage from '@/pages/curriculum/CurriculumPage'
import CurriculumManagementPage from '@/pages/admin/CurriculumManagementPage'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // 에러 로깅을 여기서 수행할 수 있습니다
          if (process.env.NODE_ENV === 'development') {
            console.error('App Error Boundary caught:', error, errorInfo)
          }
        }}
      >
        <ThemeProvider>
          <FontProvider>
            <AuthProvider>
              <ToastProvider>
                <ToastContainer />
              <Routes>
          {/* 랜딩 페이지 */}
          <Route path="/" element={<LandingPage />} />

          {/* 인증 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/student/signup" element={<StudentSignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* 역할별 대시보드 */}
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* 프로필 & 설정 */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* 과목 */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          {/* 과제, 성적, 진도 */}
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/grades" element={<GradesPage />} />

          {/* 교수 전용 */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />

          {/* 관리자 */}
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/classes" element={<ClassManagementPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
          <Route path="/admin/settings" element={<SystemSettingsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/curricula" element={<CurriculumManagementPage />} />

          {/* 404 페이지 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">페이지를 찾을 수 없습니다</h1></div>} />
              </Routes>
              </ToastProvider>
            </AuthProvider>
          </FontProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
