import type { User, Curriculum, Class, WeeklySession, Enrollment, AdminLog, Question } from './schema'

// 초기 사용자 데이터
export const seedUsers: User[] = [
  {
    id: 1,
    email: 'student@eduverse.com',
    name: '김학생',
    password: 'password123',
    role: 'student',
    status: 'active',
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'student2@eduverse.com',
    name: '이학생',
    password: 'password123',
    role: 'student',
    status: 'active',
    emailVerified: true,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 3,
    email: 'professor@eduverse.com',
    name: '박교수',
    password: 'password123',
    role: 'professor',
    status: 'active',
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 4,
    email: 'admin@eduverse.com',
    name: '관리자',
    password: 'password123',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

// 최근 7일간 가입한 사용자들 (차트 데이터용)
const getRecentDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// 추가 사용자 데이터 (최근 7일 가입자)
const recentUsers: User[] = [
  // 6일 전: 5명
  { id: 5, email: 'student3@eduverse.com', name: '최학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(6), updatedAt: getRecentDate(6) },
  { id: 6, email: 'student4@eduverse.com', name: '정학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(6), updatedAt: getRecentDate(6) },
  { id: 7, email: 'student5@eduverse.com', name: '강학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(6), updatedAt: getRecentDate(6) },
  { id: 8, email: 'student6@eduverse.com', name: '조학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(6), updatedAt: getRecentDate(6) },
  { id: 9, email: 'student7@eduverse.com', name: '윤학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(6), updatedAt: getRecentDate(6) },

  // 5일 전: 8명
  { id: 10, email: 'student8@eduverse.com', name: '장학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 11, email: 'student9@eduverse.com', name: '임학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 12, email: 'student10@eduverse.com', name: '한학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 13, email: 'student11@eduverse.com', name: '오학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 14, email: 'student12@eduverse.com', name: '서학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 15, email: 'student13@eduverse.com', name: '신학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 16, email: 'student14@eduverse.com', name: '권학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },
  { id: 17, email: 'student15@eduverse.com', name: '황학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(5), updatedAt: getRecentDate(5) },

  // 4일 전: 3명
  { id: 18, email: 'student16@eduverse.com', name: '안학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(4), updatedAt: getRecentDate(4) },
  { id: 19, email: 'student17@eduverse.com', name: '송학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(4), updatedAt: getRecentDate(4) },
  { id: 20, email: 'student18@eduverse.com', name: '전학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(4), updatedAt: getRecentDate(4) },

  // 3일 전: 7명
  { id: 21, email: 'student19@eduverse.com', name: '홍학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },
  { id: 22, email: 'student20@eduverse.com', name: '유학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },
  { id: 23, email: 'student21@eduverse.com', name: '고학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },
  { id: 24, email: 'student22@eduverse.com', name: '문학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },
  { id: 25, email: 'student23@eduverse.com', name: '양학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },
  { id: 26, email: 'student24@eduverse.com', name: '손학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },
  { id: 27, email: 'student25@eduverse.com', name: '배학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(3), updatedAt: getRecentDate(3) },

  // 2일 전: 12명
  { id: 28, email: 'student26@eduverse.com', name: '조학생2', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 29, email: 'student27@eduverse.com', name: '백학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 30, email: 'student28@eduverse.com', name: '허학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 31, email: 'student29@eduverse.com', name: '남학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 32, email: 'student30@eduverse.com', name: '심학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 33, email: 'student31@eduverse.com', name: '노학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 34, email: 'student32@eduverse.com', name: '정학생2', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 35, email: 'student33@eduverse.com', name: '하학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 36, email: 'student34@eduverse.com', name: '곽학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 37, email: 'student35@eduverse.com', name: '성학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 38, email: 'student36@eduverse.com', name: '차학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },
  { id: 39, email: 'student37@eduverse.com', name: '주학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(2), updatedAt: getRecentDate(2) },

  // 1일 전: 4명
  { id: 40, email: 'student38@eduverse.com', name: '우학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(1), updatedAt: getRecentDate(1) },
  { id: 41, email: 'student39@eduverse.com', name: '구학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(1), updatedAt: getRecentDate(1) },
  { id: 42, email: 'student40@eduverse.com', name: '라학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(1), updatedAt: getRecentDate(1) },
  { id: 43, email: 'student41@eduverse.com', name: '나학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(1), updatedAt: getRecentDate(1) },

  // 오늘: 2명
  { id: 44, email: 'student42@eduverse.com', name: '마학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(0), updatedAt: getRecentDate(0) },
  { id: 45, email: 'student43@eduverse.com', name: '사학생', password: 'password123', role: 'student', status: 'active', emailVerified: true, createdAt: getRecentDate(0), updatedAt: getRecentDate(0) },
]

// 추가 교수 데이터 (10명) - 다양한 부서에 소속, 상태별로 균등 분배
const professorNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
const departments = ['컴퓨터과학과', '소프트웨어공학과', '정보통신학과', '전자공학과', '산업공학과', '건축학과', '토목공학과', '기계공학과', '화학공학과', '신소재공학과']
const statuses: ('active' | 'inactive' | 'suspended')[] = [
  'active', 'active', 'active', 'active',      // 4명: active
  'inactive', 'inactive', 'inactive',           // 3명: inactive
  'suspended', 'suspended', 'suspended'         // 3명: suspended
]

const additionalProfessors: User[] = professorNames.map((lastName, index) => ({
  id: 100 + index, // ID 100부터 시작
  email: `professor${index + 1}@eduverse.com`,
  name: `${lastName}교수`,
  password: 'password123',
  role: 'professor' as const,
  status: statuses[index],
  department: departments[index],
  emailVerified: true,
  createdAt: getRecentDate(Math.floor(Math.random() * 30)), // 최근 30일 내 랜덤
  updatedAt: getRecentDate(Math.floor(Math.random() * 30)),
}))

// 추가 학생 데이터 (100명) - 다양한 부서/학과에 분배, 상태별 균등 분배
const koreanLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍', '유', '고', '문', '양', '손', '배', '백', '허', '남', '심', '노', '하', '곽', '성', '차', '주', '우', '구', '나', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하']
const studentDepartments = [
  '컴퓨터과학과', '소프트웨어공학과', '정보통신학과', '전자공학과', '산업공학과',
  '건축학과', '토목공학과', '기계공학과', '화학공학과', '신소재공학과',
  '경영학과', '경제학과', '회계학과', '마케팅학과', '금융학과',
  '영어영문학과', '일어일문학과', '중국어중문학과', '불어불문학과', '독어독문학과',
]
const studentStatuses: ('active' | 'inactive' | 'suspended')[] = []
for (let i = 0; i < 60; i++) studentStatuses.push('active')      // 60명: active
for (let i = 0; i < 25; i++) studentStatuses.push('inactive')    // 25명: inactive
for (let i = 0; i < 15; i++) studentStatuses.push('suspended')   // 15명: suspended

const studentNumbers = Array.from({ length: 100 }, (_, i) => i)

const additionalStudents: User[] = studentNumbers.map((num) => {
  const lastName = koreanLastNames[num % koreanLastNames.length]
  const department = studentDepartments[num % studentDepartments.length]
  const status = studentStatuses[num]
  const randomDays = Math.floor(Math.random() * 90) // 최근 90일 내 랜덤
  const studentId = `STU${String(2025001 + num).padStart(5, '0')}` // STU20250001 ~ STU20250100

  return {
    id: 200 + num, // ID 200부터 시작 (200-299)
    email: `student${100 + num}@eduverse.com`,
    name: `${lastName}학생${String(num + 1).padStart(2, '0')}`,
    password: 'password123',
    role: 'student' as const,
    status: status,
    department: department,
    studentId: studentId,
    phone: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    bio: `${department} 학생입니다.`,
    emailVerified: true,
    createdAt: getRecentDate(randomDays),
    updatedAt: getRecentDate(randomDays),
  }
})

// 모든 사용자 데이터 병합
export { seedUsers as seedUsersBase }
export const seedUsersAll = [
  ...seedUsers,
  ...recentUsers,
  ...additionalProfessors,
  ...additionalStudents
]

// 초기 커리큘럼 데이터
export const seedCurricula: Curriculum[] = [
  {
    id: 1,
    name: 'C 프로그래밍 기초',
    description: 'C언어 기본 문법, 포인터, 구조체',
    language: 'C',
    weeks: 12,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Java 프로그래밍 기초',
    description: 'Java 객체지향 프로그래밍 입문',
    language: 'Java',
    weeks: 12,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'JavaScript 프로그래밍 기초',
    description: '웹 개발을 위한 JavaScript 기초',
    language: 'JavaScript',
    weeks: 12,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'C# 프로그래밍 기초',
    description: 'C# 언어 기본 및 .NET 환경',
    language: 'C#',
    weeks: 12,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  },
]

// 초기 수업 데이터
export const seedClasses: Class[] = [
  {
    id: 1,
    professorId: 3,
    curriculumId: 1,
    name: 'C 프로그래밍 기초 2025 1학기',
    description: 'C언어 기본 문법과 포인터를 배우는 수업입니다.',
    year: 2025,
    semester: '1학기',
    invitationCode: 'ABC123',
    qrCodeUrl: '/qr/ABC123.png',
    createdAt: '2025-01-15T00:00:00Z',
    deletedAt: null,
  },
  {
    id: 2,
    professorId: 3,
    curriculumId: 2,
    name: 'Java 프로그래밍 기초 2025 1학기',
    description: 'Java 객체지향 프로그래밍을 배우는 수업입니다.',
    year: 2025,
    semester: '1학기',
    invitationCode: 'DEF456',
    qrCodeUrl: '/qr/DEF456.png',
    createdAt: '2025-01-15T00:00:00Z',
    deletedAt: null,
  },
]

// 초기 주차별 수업 데이터 (수업 1의 1-12주차)
export const seedWeeklySessions: WeeklySession[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: i + 1,
    classId: 1,
    weekNumber: i + 1,
    status: 'not_started' as const,
    startedAt: null,
    endedAt: null,
    autoEndAt: null,
    createdAt: '2025-01-15T00:00:00Z',
  })
)

// 초기 수업 참여 데이터
export const seedEnrollments: Enrollment[] = [
  {
    id: 1,
    studentId: 1,
    classId: 1,
    enrolledAt: '2025-01-16T00:00:00Z',
    withdrawnAt: null,
    isActive: true,
  },
  {
    id: 2,
    studentId: 2,
    classId: 1,
    enrolledAt: '2025-01-16T00:00:00Z',
    withdrawnAt: null,
    isActive: true,
  },
]

// 관리자 활동 로그 생성 함수
function generateAdminLogs(): AdminLog[] {
  const logs: AdminLog[] = []
  const actions: AdminLog['action'][] = ['change_user_status', 'delete_user', 'create_curriculum']
  const targetTypes: ('user' | 'curriculum' | 'class' | 'system')[] = ['user', 'curriculum', 'class', 'system']
  const adminId = 4 // 관리자 ID

  const now = new Date('2025-10-19T12:00:00Z')
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const userActions = [
    '사용자 상태를 active로 변경했습니다.',
    '사용자 상태를 suspended로 변경했습니다.',
    '사용자 정보를 수정했습니다.',
    '새로운 사용자를 생성했습니다.',
    '사용자를 비활성화했습니다.',
    '사용자 권한을 변경했습니다.',
  ]

  const curriculumActions = [
    '새로운 커리큘럼을 생성했습니다.',
    '커리큘럼을 수정했습니다.',
    '커리큘럼을 삭제했습니다.',
    '커리큘럼 주차 정보를 업데이트했습니다.',
  ]

  const classActions = [
    '새로운 수업을 생성했습니다.',
    '수업 정보를 수정했습니다.',
    '수업에 학생을 추가했습니다.',
    '수업에서 학생을 제거했습니다.',
    '수업 상태를 변경했습니다.',
  ]

  const systemActions = [
    '시스템 설정을 변경했습니다.',
    '이메일 설정을 업데이트했습니다.',
    '보안 설정을 수정했습니다.',
    '백업을 수행했습니다.',
  ]

  for (let i = 1; i <= 200; i++) {
    // 랜덤 날짜 생성 (최근 90일)
    const randomTime = ninetyDaysAgo.getTime() + Math.random() * (now.getTime() - ninetyDaysAgo.getTime())
    const createdAt = new Date(randomTime).toISOString()

    // 랜덤 액션 및 타겟 타입
    const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)]
    let action: AdminLog['action']
    let details: string
    let targetId: number | null = null
    let targetUserId: number | null = null
    let reason: string | null = null

    if (targetType === 'user') {
      action = Math.random() > 0.7 ? 'delete_user' : 'change_user_status'
      details = userActions[Math.floor(Math.random() * userActions.length)]
      targetUserId = Math.floor(Math.random() * 20) + 1
      targetId = targetUserId
      if (action === 'delete_user') {
        reason = '규정 위반'
      }
    } else if (targetType === 'curriculum') {
      action = 'create_curriculum'
      details = curriculumActions[Math.floor(Math.random() * curriculumActions.length)]
      targetId = Math.floor(Math.random() * 10) + 1
    } else if (targetType === 'class') {
      action = 'change_user_status'
      details = classActions[Math.floor(Math.random() * classActions.length)]
      targetId = Math.floor(Math.random() * 15) + 1
    } else {
      action = 'change_user_status'
      details = systemActions[Math.floor(Math.random() * systemActions.length)]
      targetId = null
    }

    logs.push({
      id: i,
      adminId,
      action,
      targetUserId,
      targetType,
      targetId,
      reason,
      details,
      createdAt,
    })
  }

  // 날짜순 정렬 (최신순)
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 관리자 활동 로그 데이터
export const seedAdminLogs: AdminLog[] = generateAdminLogs()

// 질의응답 데이터
export const seedQuestions: Question[] = [
  {
    id: 1,
    studentId: 1,
    classId: 1,
    weekNumber: 2,
    title: '조건문과 반복문',
    content: 'for문과 while문의 차이점이 무엇인가요? 언제 어떤 것을 사용하는 것이 좋을까요?',
    priority: 'normal',
    answered: true,
    createdAt: '2025-10-22',
  },
  {
    id: 2,
    studentId: 1,
    classId: 1,
    weekNumber: 3,
    title: '함수의 이해',
    content: '함수에서 return 문이 없으면 어떻게 되나요? None이 반환되는 것이 맞나요?',
    priority: 'normal',
    answered: true,
    createdAt: '2025-10-25',
  },
  {
    id: 3,
    studentId: 1,
    classId: 1,
    weekNumber: 4,
    title: '리스트와 튜플',
    content: '리스트 슬라이싱에서 [::-1]은 어떤 의미인가요? 리스트를 역순으로 만드는 다른 방법도 있나요?',
    priority: 'urgent',
    answered: false,
    createdAt: '2025-10-27',
  },
  {
    id: 4,
    studentId: 1,
    classId: 1,
    weekNumber: 4,
    title: '리스트와 튜플',
    content: '튜플은 불변이라고 했는데, 튜플 안에 리스트가 있으면 그 리스트는 변경 가능한가요?',
    priority: 'normal',
    answered: false,
    createdAt: '2025-10-28',
  },
  {
    id: 5,
    studentId: 1,
    classId: 1,
    weekNumber: 5,
    title: '딕셔너리와 집합',
    content: '딕셔너리의 get() 메서드와 []를 사용한 접근의 차이점이 무엇인가요?',
    priority: 'normal',
    answered: true,
    createdAt: '2025-10-29',
  },
  {
    id: 6,
    studentId: 1,
    classId: 1,
    weekNumber: 3,
    title: '함수의 이해',
    content: '재귀함수가 무엇인지 이해가 잘 안 됩니다. 간단한 예제로 설명해주실 수 있나요?',
    priority: 'normal',
    answered: true,
    createdAt: '2025-10-26',
  },
  {
    id: 7,
    studentId: 1,
    classId: 1,
    weekNumber: 2,
    title: '조건문과 반복문',
    content: 'break와 continue의 차이가 헷갈립니다. 실제 사용 예를 보여주실 수 있나요?',
    priority: 'normal',
    answered: false,
    createdAt: '2025-10-23',
  },
]
