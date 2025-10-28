import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const coursesHandlers = [
  // 학생: 수강 중인 과목 목록
  http.get('/api/courses/enrolled', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const userId = parseInt(token.split('-').pop() || '0')

      const user = db.users.findById(userId)

      if (!user || user.role !== 'student') {
        return HttpResponse.json(
          { status: 'error', message: '학생 계정만 접근 가능합니다.' },
          { status: 403 }
        )
      }

      // 학생이 수강 중인 과목 조회
      const enrollments = db.enrollments.findByStudentId(userId)
      const courses = enrollments.map((enrollment) => {
        const classData = db.classes.findById(enrollment.classId)
        if (!classData) return null

        const curriculum = db.curricula.findById(classData.curriculumId)
        const professor = db.users.findById(classData.professorId)
        const allEnrollments = db.enrollments.findByClassId(classData.id)

        // Mock: 진도율 계산 (실제로는 세션 완료 데이터 기반)
        const progress = Math.floor(Math.random() * 100)
        const assignmentCount = 12
        const completedAssignments = Math.floor(Math.random() * assignmentCount)

        return {
          id: classData.id,
          name: classData.name,
          semester: classData.semester,
          year: classData.year,
          curriculumName: curriculum?.name || '',
          professorName: professor?.name || '',
          studentCount: allEnrollments.length,
          invitationCode: classData.invitationCode,
          progress,
          assignmentCount,
          completedAssignments,
        }
      }).filter(Boolean)

      return HttpResponse.json({
        status: 'success',
        data: { courses },
      })
    } catch (error) {
      console.error('[MSW] 수강 과목 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 교수: 진행 중인 수업 목록
  http.get('/api/courses/teaching', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const userId = parseInt(token.split('-').pop() || '0')

      const user = db.users.findById(userId)

      if (!user || user.role !== 'professor') {
        return HttpResponse.json(
          { status: 'error', message: '교수 계정만 접근 가능합니다.' },
          { status: 403 }
        )
      }

      // 교수가 진행 중인 수업 조회
      const classes = db.classes.findByProfessorId(userId)
      const courses = classes.map((classData) => {
        const curriculum = db.curricula.findById(classData.curriculumId)
        const enrollments = db.enrollments.findByClassId(classData.id)

        return {
          id: classData.id,
          name: classData.name,
          semester: classData.semester,
          year: classData.year,
          curriculumName: curriculum?.name || '',
          professorName: user.name,
          studentCount: enrollments.length,
          invitationCode: classData.invitationCode,
        }
      })

      return HttpResponse.json({
        status: 'success',
        data: { courses },
      })
    } catch (error) {
      console.error('[MSW] 수업 목록 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수강 신청 (초대 코드)
  http.post('/api/courses/enroll', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const userId = parseInt(token.split('-').pop() || '0')
      const body = await request.json() as any

      const user = db.users.findById(userId)

      if (!user || user.role !== 'student') {
        return HttpResponse.json(
          { status: 'error', message: '학생 계정만 수강 신청할 수 있습니다.' },
          { status: 403 }
        )
      }

      // 초대 코드로 클래스 찾기
      const classData = db.classes.findByInvitationCode(body.invitationCode)

      if (!classData) {
        return HttpResponse.json(
          { status: 'error', message: '올바르지 않은 초대 코드입니다.' },
          { status: 404 }
        )
      }

      // 이미 수강 중인지 확인
      const existingEnrollment = db.enrollments.findOne(userId, classData.id)

      if (existingEnrollment && existingEnrollment.isActive) {
        return HttpResponse.json(
          { status: 'error', message: '이미 수강 중인 과목입니다.' },
          { status: 409 }
        )
      }

      // 수강 신청 또는 재등록
      if (existingEnrollment && !existingEnrollment.isActive) {
        db.enrollments.rejoin(existingEnrollment.id)
      } else {
        db.enrollments.create({
          studentId: userId,
          classId: classData.id,
          enrolledAt: new Date().toISOString(),
          withdrawnAt: null,
          isActive: true,
        })
      }

      return HttpResponse.json({
        status: 'success',
        message: '수강 신청이 완료되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 수강 신청 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 과목 상세 조회
  http.get('/api/courses/:id', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const userId = parseInt(token.split('-').pop() || '0')
      const classId = parseInt(params.id as string)

      const user = db.users.findById(userId)
      const classData = db.classes.findById(classId)

      if (!classData) {
        return HttpResponse.json(
          { status: 'error', message: '과목을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 접근 권한 확인
      if (user?.role === 'student') {
        const enrollment = db.enrollments.findOne(userId, classId)
        if (!enrollment || !enrollment.isActive) {
          return HttpResponse.json(
            { status: 'error', message: '수강 중인 과목이 아닙니다.' },
            { status: 403 }
          )
        }
      } else if (user?.role === 'professor') {
        if (classData.professorId !== userId) {
          return HttpResponse.json(
            { status: 'error', message: '담당 수업이 아닙니다.' },
            { status: 403 }
          )
        }
      }

      const curriculum = db.curricula.findById(classData.curriculumId)
      const professor = db.users.findById(classData.professorId)
      const enrollments = db.enrollments.findByClassId(classId)

      // 주차별 세션 조회
      const sessions = db.weeklySessions.findByClassId(classId).map((session) => {
        // Mock 데이터
        const totalStudents = enrollments.length
        const completedStudents = Math.floor(Math.random() * totalStudents)
        const progress = user?.role === 'student' ? Math.floor(Math.random() * 100) : undefined

        return {
          id: session.id,
          weekNumber: session.weekNumber,
          status: session.status,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          completedStudents: user?.role === 'professor' ? completedStudents : undefined,
          totalStudents: user?.role === 'professor' ? totalStudents : undefined,
          progress,
        }
      })

      const course = {
        id: classData.id,
        name: classData.name,
        semester: classData.semester,
        year: classData.year,
        curriculumName: curriculum?.name || '',
        curriculumDescription: curriculum?.description || '',
        professorName: professor?.name || '',
        studentCount: enrollments.length,
        invitationCode: classData.invitationCode,
        weeks: curriculum?.weeks || 12,
      }

      return HttpResponse.json({
        status: 'success',
        data: { course, sessions },
      })
    } catch (error) {
      console.error('[MSW] 과목 상세 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),
]
