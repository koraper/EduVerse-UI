import type {
  User,
  Curriculum,
  Class,
  WeeklySession,
  Enrollment,
  Submission,
  Question,
  Answer,
  AdminLog,
} from './schema'
import {
  seedUsersAll,
  seedCurricula,
  seedClasses,
  seedWeeklySessions,
  seedEnrollments,
  seedAdminLogs,
  seedQuestions,
} from './seed'
import {
  loadFromStorage,
  saveToStorage,
  clearStorage as clearStorageUtil,
  getStorageInfo,
  isStorageAvailable,
} from './storage'

// localStorage에서 데이터 로드 시도
const storedData = loadFromStorage()

// 데이터 저장소 초기화
let users: User[] = storedData?.data.users || [...seedUsersAll]
let curricula: Curriculum[] = storedData?.data.curricula || [...seedCurricula]
let classes: Class[] = storedData?.data.classes || [...seedClasses]
let weeklySessions:  WeeklySession[] = storedData?.data.weeklySessions || [...seedWeeklySessions]
let enrollments: Enrollment[] = storedData?.data.enrollments || [...seedEnrollments]
let submissions: Submission[] = storedData?.data.submissions || []
let questions: Question[] = storedData?.data.questions || [...seedQuestions]
let answers: Answer[] = storedData?.data.answers || []
let adminLogs: AdminLog[] = storedData?.data.adminLogs || [...seedAdminLogs]

// localStorage 사용 가능 여부 확인
const storageEnabled = isStorageAvailable()
if (!storageEnabled) {
  console.warn('[Mock DB] localStorage를 사용할 수 없습니다. 새로고침 시 데이터가 초기화됩니다.')
}

// 디버깅: 초기화된 데이터 확인
console.log('[Mock DB] Initialized with:', {
  users: users.length,
  questions: questions.length,
  curricula: curricula.length,
  classes: classes.length,
})
console.log('[Mock DB] Questions detail:', questions)
console.log('[Mock DB] Student 1 questions:', questions.filter(q => q.studentId === 1))

/**
 * 데이터 변경 후 localStorage에 동기화
 */
const syncToStorage = (): void => {
  if (!storageEnabled) return

  saveToStorage({
    users,
    curricula,
    classes,
    weeklySessions,
    enrollments,
    submissions,
    questions,
    answers,
    adminLogs,
  })
}

// 인메모리 데이터베이스
export const db = {
  // 사용자
  users: {
    findAll: () => users,
    findById: (id: number) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    findByToken: (token: string) => users.find((u) => u.email === token.split('@')[0] + '@eduverse.com'),
    create: (user: Omit<User, 'id'>) => {
      const newUser = { ...user, id: users.length + 1 }
      users.push(newUser)
      syncToStorage()
      return newUser
    },
    update: (id: number, data: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() }
        syncToStorage()
        return users[index]
      }
      return null
    },
    delete: (id: number) => {
      users = users.filter((u) => u.id !== id)
      syncToStorage()
    },
  },

  // 커리큘럼
  curricula: {
    findAll: () => curricula,
    findById: (id: number) => curricula.find((c) => c.id === id),
    findByLanguage: (language: string) => curricula.filter((c) => c.language === language),
    create: (curriculum: Omit<Curriculum, 'id'>) => {
      const maxId = curricula.length > 0 ? Math.max(...curricula.map((c) => c.id)) : 0
      const newCurriculum = { ...curriculum, id: maxId + 1 }
      curricula.push(newCurriculum)
      syncToStorage()
      return newCurriculum
    },
    update: (id: number, data: Partial<Curriculum>) => {
      const index = curricula.findIndex((c) => c.id === id)
      if (index !== -1) {
        curricula[index] = { ...curricula[index], ...data }
        syncToStorage()
        return curricula[index]
      }
      return null
    },
    delete: (id: number) => {
      curricula = curricula.filter((c) => c.id !== id)
      syncToStorage()
    },
  },

  // 수업
  classes: {
    findAll: () => classes.filter((c) => c.deletedAt === null),
    findById: (id: number) => classes.find((c) => c.id === id),
    findByProfessorId: (professorId: number) =>
      classes.filter((c) => c.professorId === professorId && c.deletedAt === null),
    findByInvitationCode: (code: string) =>
      classes.find((c) => c.invitationCode === code && c.deletedAt === null),
    create: (cls: Omit<Class, 'id'>) => {
      const newClass = { ...cls, id: classes.length + 1 }
      classes.push(newClass)

      // 주차별 수업 자동 생성 (1-12주차)
      const curriculum = curricula.find((c) => c.id === cls.curriculumId)
      if (curriculum) {
        for (let week = 1; week <= curriculum.weeks; week++) {
          db.weeklySessions.create({
            classId: newClass.id,
            weekNumber: week,
            status: 'not_started',
            startedAt: null,
            endedAt: null,
            autoEndAt: null,
            createdAt: new Date().toISOString(),
          })
        }
      }

      syncToStorage()
      return newClass
    },
    update: (id: number, data: Partial<Class>) => {
      const index = classes.findIndex((c) => c.id === id)
      if (index !== -1) {
        classes[index] = { ...classes[index], ...data }
        syncToStorage()
        return classes[index]
      }
      return null
    },
    softDelete: (id: number) => {
      const index = classes.findIndex((c) => c.id === id)
      if (index !== -1) {
        classes[index].deletedAt = new Date().toISOString()
        syncToStorage()
        return classes[index]
      }
      return null
    },
  },

  // 주차별 수업
  weeklySessions: {
    findAll: () => weeklySessions,
    findByClassId: (classId: number) =>
      weeklySessions.filter((ws) => ws.classId === classId),
    findById: (id: number) => weeklySessions.find((ws) => ws.id === id),
    findInProgress: (classId: number) =>
      weeklySessions.find((ws) => ws.classId === classId && ws.status === 'in_progress'),
    create: (session: Omit<WeeklySession, 'id'>) => {
      const newSession = { ...session, id: weeklySessions.length + 1 }
      weeklySessions.push(newSession)
      syncToStorage()
      return newSession
    },
    update: (id: number, data: Partial<WeeklySession>) => {
      const index = weeklySessions.findIndex((ws) => ws.id === id)
      if (index !== -1) {
        weeklySessions[index] = { ...weeklySessions[index], ...data }
        syncToStorage()
        return weeklySessions[index]
      }
      return null
    },
  },

  // 수업 참여
  enrollments: {
    findAll: () => enrollments,
    findByStudentId: (studentId: number) =>
      enrollments.filter((e) => e.studentId === studentId && e.isActive),
    findByClassId: (classId: number) =>
      enrollments.filter((e) => e.classId === classId && e.isActive),
    findOne: (studentId: number, classId: number) =>
      enrollments.find((e) => e.studentId === studentId && e.classId === classId),
    findByClassIdAndUserId: (classId: number, userId: number) =>
      enrollments.find((e) => e.classId === classId && e.studentId === userId && e.isActive),
    create: (enrollment: Omit<Enrollment, 'id'>) => {
      const newEnrollment = { ...enrollment, id: enrollments.length + 1 }
      enrollments.push(newEnrollment)
      syncToStorage()
      return newEnrollment
    },
    withdraw: (id: number) => {
      const index = enrollments.findIndex((e) => e.id === id)
      if (index !== -1) {
        enrollments[index].withdrawnAt = new Date().toISOString()
        enrollments[index].isActive = false
        syncToStorage()
        return enrollments[index]
      }
      return null
    },
    rejoin: (id: number) => {
      const index = enrollments.findIndex((e) => e.id === id)
      if (index !== -1) {
        enrollments[index].withdrawnAt = null
        enrollments[index].isActive = true
        syncToStorage()
        return enrollments[index]
      }
      return null
    },
    delete: (id: number) => {
      const index = enrollments.findIndex((e) => e.id === id)
      if (index !== -1) {
        enrollments.splice(index, 1)
        syncToStorage()
        return true
      }
      return false
    },
  },

  // 제출 데이터
  submissions: {
    findAll: () => submissions,
    findByStudentId: (studentId: number) =>
      submissions.filter((s) => s.studentId === studentId),
    findByTaskId: (taskId: number) => submissions.filter((s) => s.taskId === taskId),
    findFirstSubmission: (studentId: number, taskId: number) =>
      submissions.find((s) => s.studentId === studentId && s.taskId === taskId && s.isFirstSubmission),
    create: (submission: Omit<Submission, 'id'>) => {
      const newSubmission = { ...submission, id: submissions.length + 1 }
      submissions.push(newSubmission)
      syncToStorage()
      return newSubmission
    },
  },

  // 질문
  questions: {
    findAll: () => questions,
    findByClassId: (classId: number) => questions.filter((q) => q.classId === classId),
    findByStudentId: (studentId: number) => questions.filter((q) => q.studentId === studentId),
    findById: (id: number) => questions.find((q) => q.id === id),
    create: (question: Omit<Question, 'id'>) => {
      const newQuestion = { ...question, id: questions.length + 1 }
      questions.push(newQuestion)
      syncToStorage()
      return newQuestion
    },
    update: (id: number, data: Partial<Question>) => {
      const index = questions.findIndex((q) => q.id === id)
      if (index !== -1) {
        questions[index] = { ...questions[index], ...data }
        syncToStorage()
        return questions[index]
      }
      return null
    },
  },

  // 답변
  answers: {
    findAll: () => answers,
    findByQuestionId: (questionId: number) =>
      answers.filter((a) => a.questionId === questionId),
    create: (answer: Omit<Answer, 'id'>) => {
      const newAnswer = { ...answer, id: answers.length + 1 }
      answers.push(newAnswer)
      syncToStorage()
      return newAnswer
    },
  },

  // 관리자 로그
  adminLogs: {
    findAll: () => adminLogs,
    findByAdminId: (adminId: number) =>
      adminLogs.filter((log) => log.adminId === adminId),
    findRecent: (limit: number = 50) =>
      adminLogs.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit),
    create: (log: Omit<AdminLog, 'id'>) => {
      const newLog = { ...log, id: adminLogs.length + 1 }
      adminLogs.push(newLog)
      syncToStorage()
      return newLog
    },
  },

  // 데이터 초기화
  reset: () => {
    users = [...seedUsersAll]
    curricula = [...seedCurricula]
    classes = [...seedClasses]
    weeklySessions = [...seedWeeklySessions]
    enrollments = [...seedEnrollments]
    submissions = []
    questions = []
    answers = []
    adminLogs = [...seedAdminLogs]
    clearStorageUtil()
    syncToStorage()
    console.log('[Mock DB] 데이터가 초기화되었습니다.')
    console.log('- Admin Logs: 200건 생성됨')
  },

  // 현재 데이터 상태 출력 (디버깅용)
  debug: () => {
    console.log('[Mock DB] 현재 데이터 상태:')
    console.log('- Users:', users.length)
    console.log('- Curricula:', curricula.length)
    console.log('- Classes:', classes.length)
    console.log('- Weekly Sessions:', weeklySessions.length)
    console.log('- Enrollments:', enrollments.length)
    console.log('- Submissions:', submissions.length)
    console.log('- Questions:', questions.length)
    console.log('- Answers:', answers.length)
    console.log('- Admin Logs:', adminLogs.length)

    // localStorage 정보
    const storageInfo = getStorageInfo()
    console.log('\n[localStorage] 저장 정보:')
    console.log('- 저장 여부:', storageInfo.exists ? 'O' : 'X')
    if (storageInfo.exists) {
      console.log('- 용량:', storageInfo.size, 'KB')
      console.log('- 마지막 저장:', storageInfo.timestamp)
      console.log('- 버전:', storageInfo.version)
    }
  },

  // localStorage 정보 조회
  storage: {
    info: getStorageInfo,
    clear: () => {
      clearStorageUtil()
      console.log('[Mock DB] localStorage가 초기화되었습니다.')
    },
    enabled: storageEnabled,
  },
}

// 전역에서 접근 가능하도록 (개발 중 디버깅용)
if (typeof window !== 'undefined') {
  ;(window as any).__mockDB = db
}
