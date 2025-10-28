import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const adminHandlers = [
  // 관리자 통계
  http.get('/api/admin/stats', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const allUsers = db.users.findAll()
      const allClasses = db.classes.findAll()
      const allEnrollments = db.enrollments.findAll()

      const stats = {
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter((u) => u.role === 'student').length,
        totalProfessors: allUsers.filter((u) => u.role === 'professor').length,
        totalClasses: allClasses.length,
        activeClasses: allClasses.length, // Mock: 모두 활성화
        totalEnrollments: allEnrollments.filter((e) => e.isActive).length,
      }

      return HttpResponse.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      console.error('[MSW] 관리자 통계 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 최근 관리 활동
  http.get('/api/admin/recent-activity', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const recentLogs = db.adminLogs.findRecent(10)

      const activities = recentLogs.map((log) => {
        const admin = db.users.findById(log.adminId)
        const targetUser = log.targetUserId ? db.users.findById(log.targetUserId) : null

        let action = '작업 수행'
        if (log.action === 'change_user_status') {
          action = '상태 변경'
        }

        return {
          id: log.id,
          action,
          adminName: admin?.name || '알 수 없음',
          targetName: targetUser?.name || '알 수 없음',
          timestamp: log.createdAt, // ISO 8601 format (상대 시간 계산에 사용)
        }
      })

      return HttpResponse.json({
        status: 'success',
        data: { activities },
      })
    } catch (error) {
      console.error('[MSW] 최근 활동 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 전체 사용자 조회 (서버 사이드 페이지네이션 & 필터링)
  http.get('/api/admin/users', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      // 쿼리 파라미터에서 페이지네이션 및 필터링 정보 추출
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const search = url.searchParams.get('search') || ''
      const roleFilter = url.searchParams.get('role') || ''
      const statusFilter = url.searchParams.get('status') || ''

      let allUsers = db.users.findAll()

      // 필터링 적용
      if (search) {
        const searchLower = search.toLowerCase()
        allUsers = allUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
        )
      }

      if (roleFilter && roleFilter !== 'all') {
        allUsers = allUsers.filter((u) => u.role === roleFilter)
      }

      if (statusFilter && statusFilter !== 'all') {
        allUsers = allUsers.filter((u) => u.status === statusFilter)
      }

      // 페이지네이션 계산
      const total = allUsers.length
      const totalPages = Math.ceil(total / limit)
      const startIndex = (page - 1) * limit
      const paginatedUsers = allUsers.slice(startIndex, startIndex + limit)

      const users = paginatedUsers.map((u) => {
        const { password, ...userWithoutPassword } = u
        return userWithoutPassword
      })

      return HttpResponse.json({
        status: 'success',
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      })
    } catch (error) {
      console.error('[MSW] 사용자 목록 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 사용자 상태 변경
  http.patch('/api/admin/users/:id/status', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const targetUserId = parseInt(params.id as string)
      const body = await request.json() as any

      const targetUser = db.users.findById(targetUserId)

      if (!targetUser) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 관리자는 자신을 변경할 수 없음
      if (targetUserId === adminId) {
        return HttpResponse.json(
          { status: 'error', message: '자신의 계정 상태를 변경할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 다른 관리자를 변경할 수 없음
      if (targetUser.role === 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '다른 관리자의 상태를 변경할 수 없습니다.' },
          { status: 400 }
        )
      }

      const oldStatus = targetUser.status
      const newStatus = body.status

      // 사용자 상태 변경
      db.users.update(targetUserId, {
        status: newStatus,
      })

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'change_user_status',
        targetUserId,
        targetType: 'user',
        targetId: targetUserId,
        reason: body.reason || null,
        details: JSON.stringify({ oldStatus, newStatus }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '사용자 상태가 변경되었습니다.',
        data: {
          logCreated: true, // 로그 생성 여부 확인
        },
      })
    } catch (error) {
      console.error('[MSW] 사용자 상태 변경 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 사용자 정지 (하위 호환성)
  http.patch('/api/admin/users/:id/suspend', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const targetUserId = parseInt(params.id as string)
      const body = await request.json() as any

      const targetUser = db.users.findById(targetUserId)

      if (!targetUser) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 관리자는 자신을 정지할 수 없음
      if (targetUserId === adminId) {
        return HttpResponse.json(
          { status: 'error', message: '자신의 계정을 정지할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 다른 관리자를 정지할 수 없음
      if (targetUser.role === 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '다른 관리자를 정지할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 사용자 상태를 suspended로 변경
      db.users.update(targetUserId, {
        status: 'suspended',
      })

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'change_user_status',
        targetUserId,
        targetType: 'user',
        targetId: targetUserId,
        reason: body.reason,
        details: JSON.stringify({ oldStatus: targetUser.status, newStatus: 'suspended' }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '사용자가 정지되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 사용자 정지 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 사용자 정보 수정
  http.patch('/api/admin/users/:id', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const targetUserId = parseInt(params.id as string)
      const body = await request.json() as any

      const targetUser = db.users.findById(targetUserId)

      if (!targetUser) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 관리자는 자신을 수정할 수 없음
      if (targetUserId === adminId) {
        return HttpResponse.json(
          { status: 'error', message: '자신의 정보를 수정할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 다른 관리자를 수정할 수 없음
      if (targetUser.role === 'admin' && body.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '다른 관리자의 정보를 수정할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 사용자 정보 수정
      const oldData = { ...targetUser }
      db.users.update(targetUserId, {
        name: body.name,
        email: body.email,
        role: body.role,
      })

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'change_user_status', // 혹은 'update_user_info' 액션 추가
        targetUserId,
        targetType: 'user',
        targetId: targetUserId,
        reason: null,
        details: JSON.stringify({
          type: 'update',
          changes: {
            name: oldData.name !== body.name ? { old: oldData.name, new: body.name } : null,
            email: oldData.email !== body.email ? { old: oldData.email, new: body.email } : null,
            role: oldData.role !== body.role ? { old: oldData.role, new: body.role } : null,
          },
        }),
        createdAt: new Date().toISOString(),
      })

      const updatedUser = db.users.findById(targetUserId)
      const { password, ...userWithoutPassword } = updatedUser || {}

      return HttpResponse.json({
        status: 'success',
        message: '사용자 정보가 수정되었습니다.',
        data: {
          user: userWithoutPassword,
          logCreated: true,
        },
      })
    } catch (error) {
      console.error('[MSW] 사용자 정보 수정 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 사용자 삭제
  http.delete('/api/admin/users/:id', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const targetUserId = parseInt(params.id as string)
      const body = await request.json() as any

      const targetUser = db.users.findById(targetUserId)

      if (!targetUser) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 관리자는 자신을 삭제할 수 없음
      if (targetUserId === adminId) {
        return HttpResponse.json(
          { status: 'error', message: '자신의 계정을 삭제할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 다른 관리자를 삭제할 수 없음
      if (targetUser.role === 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '다른 관리자의 계정을 삭제할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 비밀번호 검증 (Mock에서는 단순 확인, 실제 구현에서는 bcrypt 비교 필요)
      if (body.password !== 'admin123') {
        return HttpResponse.json(
          { status: 'error', message: '비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }

      // 사용자 삭제
      db.users.delete(targetUserId)

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'delete_user',
        targetUserId,
        targetType: 'user',
        targetId: targetUserId,
        reason: null,
        details: JSON.stringify({
          deletedUser: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
          },
        }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '사용자가 삭제되었습니다.',
        data: {
          deletedUserId: targetUserId,
          logCreated: true,
        },
      })
    } catch (error) {
      console.error('[MSW] 사용자 삭제 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 사용자 생성
  http.post('/api/admin/users', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const body = await request.json() as any

      // 입력값 검증
      if (!body.email || !body.name || !body.password || !body.role) {
        return HttpResponse.json(
          { status: 'error', message: '필수 입력값이 누락되었습니다.' },
          { status: 400 }
        )
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return HttpResponse.json(
          { status: 'error', message: '유효한 이메일 주소를 입력하세요.' },
          { status: 400 }
        )
      }

      // 역할 검증
      const validRoles = ['student', 'professor', 'admin']
      if (!validRoles.includes(body.role)) {
        return HttpResponse.json(
          { status: 'error', message: '유효하지 않은 역할입니다.' },
          { status: 400 }
        )
      }

      // 이메일 중복 검증
      const existingUser = db.users.findByEmail(body.email)
      if (existingUser) {
        return HttpResponse.json(
          { status: 'error', message: '이미 등록된 이메일입니다.' },
          { status: 409 }
        )
      }

      // 새 사용자 생성
      const newUser = {
        id: Math.max(...db.users.findAll().map(u => u.id), 0) + 1,
        email: body.email,
        name: body.name,
        password: body.password, // Mock에서만 평문 저장 (실제는 bcrypt 해시)
        role: body.role,
        status: 'active',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: undefined,
      }

      db.users.create(newUser)

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'create_user',
        targetUserId: newUser.id,
        targetType: 'user',
        targetId: newUser.id,
        reason: null,
        details: JSON.stringify({
          newUser: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
          },
        }),
        createdAt: new Date().toISOString(),
      })

      // 비밀번호 제외하고 반환
      const { password, ...userWithoutPassword } = newUser

      return HttpResponse.json(
        {
          status: 'success',
          message: '사용자가 생성되었습니다.',
          data: {
            user: userWithoutPassword,
            logCreated: true,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[MSW] 사용자 생성 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업 목록 조회 (관리자)
  http.get('/api/admin/classes', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const allClasses = db.classes.findAll()

      const classes = allClasses.map((cls) => {
        const professor = db.users.findById(cls.professorId)
        const curriculum = db.curricula.findById(cls.curriculumId)
        const enrollments = db.enrollments.findByClassId(cls.id)

        // 진행 상태 계산
        const weeklySessions = db.weeklySessions.findByClassId(cls.id)
        const completedWeeks = weeklySessions.filter((ws) => ws.status === 'ended').length
        const currentWeek = Math.max(
          1,
          weeklySessions.findIndex((ws) => ws.status !== 'ended') + 1
        ) || completedWeeks + 1

        return {
          id: cls.id,
          name: cls.name,
          code: `CLASS-${cls.id.toString().padStart(3, '0')}`,
          description: cls.description,
          department: curriculum?.language || 'Not specified',
          credits: 3,
          professor: professor?.name || 'Unknown',
          professorId: cls.professorId,
          totalWeeks: curriculum?.weeks || 12,
          currentWeek,
          status: 'active', // Mock: 모두 active로 처리
          createdDate: cls.createdAt,
          students: enrollments.length,
        }
      })

      return HttpResponse.json({
        status: 'success',
        data: { classes },
      })
    } catch (error) {
      console.error('[MSW] 수업 목록 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업 상세 조회 (관리자)
  http.get('/api/admin/classes/:id', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const classId = parseInt(params.id as string)
      const cls = db.classes.findById(classId)

      if (!cls) {
        return HttpResponse.json(
          { status: 'error', message: '수업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const professor = db.users.findById(cls.professorId)
      const curriculum = db.curricula.findById(cls.curriculumId)
      const enrollments = db.enrollments.findByClassId(classId)

      // 수강생 정보
      const studentList = enrollments.map((enrollment) => {
        const student = db.users.findById(enrollment.studentId)
        return {
          id: student?.id,
          studentId: student?.studentId || `STU-${student?.id}`,
          name: student?.name || 'Unknown',
          email: student?.email || 'unknown@example.com',
          status: student?.status || 'active',
          enrolledDate: enrollment.enrolledAt,
        }
      })

      // 진행 상태 계산
      const weeklySessions = db.weeklySessions.findByClassId(classId)
      const completedWeeks = weeklySessions.filter((ws) => ws.status === 'ended').length
      const currentWeek = Math.max(
        1,
        weeklySessions.findIndex((ws) => ws.status !== 'ended') + 1
      ) || completedWeeks + 1

      return HttpResponse.json({
        status: 'success',
        data: {
          class: {
            id: cls.id,
            name: cls.name,
            code: `CLASS-${cls.id.toString().padStart(3, '0')}`,
            description: cls.description,
            department: curriculum?.language || 'Not specified',
            credits: 3,
            professor: professor?.name || 'Unknown',
            professorId: cls.professorId,
            totalWeeks: curriculum?.weeks || 12,
            currentWeek,
            status: 'active',
            createdDate: cls.createdAt,
            studentCount: enrollments.length,
          },
          studentList,
        },
      })
    } catch (error) {
      console.error('[MSW] 수업 상세 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업 생성
  http.post('/api/admin/classes', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const body = await request.json() as any

      // 입력값 검증
      if (!body.name || !body.code || !body.professorId || !body.curriculumId) {
        return HttpResponse.json(
          { status: 'error', message: '필수 입력값이 누락되었습니다.' },
          { status: 400 }
        )
      }

      // 교수 존재 확인
      const professor = db.users.findById(body.professorId)
      if (!professor || professor.role !== 'professor') {
        return HttpResponse.json(
          { status: 'error', message: '유효한 교수를 선택하세요.' },
          { status: 400 }
        )
      }

      // 커리큘럼 존재 확인
      const curriculum = db.curricula.findById(body.curriculumId)
      if (!curriculum) {
        return HttpResponse.json(
          { status: 'error', message: '유효한 커리큘럼을 선택하세요.' },
          { status: 400 }
        )
      }

      // 새 수업 생성
      const newClass = {
        id: Math.max(...db.classes.findAll().map(c => c.id), 0) + 1,
        name: body.name,
        code: body.code,
        description: body.description || '',
        professorId: body.professorId,
        curriculumId: body.curriculumId,
        createdAt: new Date().toISOString(),
        deletedAt: null,
      }

      db.classes.create(newClass)

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'create_user', // 임시: 시스템이 지원하는 액션 사용
        targetType: 'class',
        targetId: newClass.id,
        reason: null,
        details: JSON.stringify({
          newClass: {
            id: newClass.id,
            name: newClass.name,
            code: newClass.code,
            professor: professor.name,
          },
        }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json(
        {
          status: 'success',
          message: '수업이 생성되었습니다.',
          data: {
            class: newClass,
            logCreated: true,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[MSW] 수업 생성 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업 수정
  http.patch('/api/admin/classes/:id', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const classId = parseInt(params.id as string)
      const body = await request.json() as any
      const cls = db.classes.findById(classId)

      if (!cls) {
        return HttpResponse.json(
          { status: 'error', message: '수업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 교수 존재 확인 (필수인 경우)
      if (body.professorId && body.professorId !== cls.professorId) {
        const professor = db.users.findById(body.professorId)
        if (!professor || professor.role !== 'professor') {
          return HttpResponse.json(
            { status: 'error', message: '유효한 교수를 선택하세요.' },
            { status: 400 }
          )
        }
      }

      // 수업 정보 수정
      const oldData = { ...cls }
      db.classes.update(classId, {
        name: body.name || cls.name,
        code: body.code || cls.code,
        description: body.description !== undefined ? body.description : cls.description,
        professorId: body.professorId || cls.professorId,
        curriculumId: body.curriculumId || cls.curriculumId,
      })

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'change_user_status', // 임시
        targetType: 'class',
        targetId: classId,
        reason: null,
        details: JSON.stringify({
          type: 'update',
          changes: {
            name: oldData.name !== body.name ? { old: oldData.name, new: body.name } : null,
            code: oldData.code !== body.code ? { old: oldData.code, new: body.code } : null,
            professorId: oldData.professorId !== body.professorId ? { old: oldData.professorId, new: body.professorId } : null,
          },
        }),
        createdAt: new Date().toISOString(),
      })

      const updatedClass = db.classes.findById(classId)

      return HttpResponse.json({
        status: 'success',
        message: '수업이 수정되었습니다.',
        data: {
          class: updatedClass,
          logCreated: true,
        },
      })
    } catch (error) {
      console.error('[MSW] 수업 수정 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업 삭제
  http.delete('/api/admin/classes/:id', async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const classId = parseInt(params.id as string)
      const body = await request.json() as any
      const cls = db.classes.findById(classId)

      if (!cls) {
        return HttpResponse.json(
          { status: 'error', message: '수업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 비밀번호 검증
      if (body.password !== 'admin123') {
        return HttpResponse.json(
          { status: 'error', message: '비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }

      // 수업 삭제
      db.classes.delete(classId)

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'delete_user', // 임시
        targetType: 'class',
        targetId: classId,
        reason: null,
        details: JSON.stringify({
          deletedClass: {
            id: cls.id,
            name: cls.name,
            code: cls.code,
          },
        }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '수업이 삭제되었습니다.',
        data: {
          deletedClassId: classId,
          logCreated: true,
        },
      })
    } catch (error) {
      console.error('[MSW] 수업 삭제 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 교수 목록 조회 (수업 생성/수정용)
  http.get('/api/admin/professors', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const professors = db.users.findAll().filter((u) => u.role === 'professor')

      return HttpResponse.json({
        status: 'success',
        data: {
          professors: professors.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
          })),
        },
      })
    } catch (error) {
      console.error('[MSW] 교수 목록 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업별 학생 목록 조회
  http.get('/api/admin/classes/:classId/students', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const classId = parseInt(params.classId as string)
      const cls = db.classes.findById(classId)

      if (!cls) {
        return HttpResponse.json(
          { status: 'error', message: '수업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // Mock: 수업에 속한 학생 목록 생성
      const enrollments = db.enrollments.findByClassId(classId)
      const students = enrollments
        .map((e) => db.users.findById(e.studentId))
        .filter((u): u is any => u !== undefined && u.role === 'student')
        .map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }))

      return HttpResponse.json({
        status: 'success',
        data: {
          classId,
          className: cls.name,
          students,
          totalCount: students.length,
        },
      })
    } catch (error) {
      console.error('[MSW] 수업별 학생 목록 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업에 학생 추가
  http.post('/api/admin/classes/:classId/students', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const classId = parseInt(params.classId as string)
      const cls = db.classes.findById(classId)

      if (!cls) {
        return HttpResponse.json(
          { status: 'error', message: '수업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const body = (await request.json()) as any
      const studentIds = Array.isArray(body.studentIds) ? body.studentIds : []

      if (studentIds.length === 0) {
        return HttpResponse.json(
          { status: 'error', message: '학생을 선택해주세요.' },
          { status: 400 }
        )
      }

      // Mock: 학생 등록
      let addedCount = 0
      for (const studentId of studentIds) {
        const student = db.users.findById(studentId)
        if (student && student.role === 'student') {
          // 중복 등록 방지
          const existing = db.enrollments.findByClassIdAndUserId(classId, studentId)
          if (!existing) {
            db.enrollments.create({
              classId,
              studentId: studentId,
              enrolledAt: new Date().toISOString(),
              withdrawnAt: null,
              isActive: true,
            })
            addedCount++
          }
        }
      }

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId: userId,
        action: 'change_user_status',
        targetType: 'class',
        targetId: classId,
        targetUserId: undefined,
        reason: null,
        details: `${addedCount}명의 학생을 수업에 추가했습니다.`,
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        data: {
          classId,
          addedCount,
          message: `${addedCount}명의 학생이 추가되었습니다.`,
        },
      })
    } catch (error) {
      console.error('[MSW] 학생 추가 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 수업에서 학생 제거
  http.delete('/api/admin/classes/:classId/students/:studentId', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const classId = parseInt(params.classId as string)
      const studentId = parseInt(params.studentId as string)

      const cls = db.classes.findById(classId)
      if (!cls) {
        return HttpResponse.json(
          { status: 'error', message: '수업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const student = db.users.findById(studentId)
      if (!student) {
        return HttpResponse.json(
          { status: 'error', message: '학생을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // Mock: 등록 제거
      const enrollment = db.enrollments.findByClassIdAndUserId(classId, studentId)
      if (enrollment) {
        db.enrollments.delete(enrollment.id)
      }

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId: userId,
        action: 'change_user_status',
        targetType: 'class',
        targetId: classId,
        targetUserId: studentId,
        reason: null,
        details: `학생(${student.name})을 수업에서 제거했습니다.`,
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        data: {
          classId,
          studentId,
          message: '학생이 제거되었습니다.',
        },
      })
    } catch (error) {
      console.error('[MSW] 학생 제거 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 관리 로그 조회 (검색, 필터링, 페이지네이션)
  http.get('/api/admin/logs', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      // 쿼리 파라미터 추출
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''
      const actionFilter = url.searchParams.get('action') || 'all'
      const dateRange = url.searchParams.get('dateRange') || '30d'

      let logs = db.adminLogs.findAll()

      // 날짜 범위 필터링
      const now = new Date()
      let filterDate = new Date()

      if (dateRange === '7d') {
        filterDate.setDate(now.getDate() - 7)
      } else if (dateRange === '30d') {
        filterDate.setDate(now.getDate() - 30)
      } else if (dateRange === '90d') {
        filterDate.setDate(now.getDate() - 90)
      }
      // 'all'인 경우 필터링 안 함

      if (dateRange !== 'all') {
        logs = logs.filter((log) => new Date(log.createdAt) >= filterDate)
      }

      // 액션 필터링
      if (actionFilter !== 'all') {
        logs = logs.filter((log) => {
          if (actionFilter === 'create') return log.action === 'create_curriculum'
          if (actionFilter === 'update') return log.action === 'change_user_status'
          if (actionFilter === 'delete') return log.action === 'delete_user'
          if (actionFilter === 'suspend') return log.action === 'change_user_status' && log.details?.includes('suspended')
          if (actionFilter === 'activate') return log.action === 'change_user_status' && log.details?.includes('active')
          return true
        })
      }

      // 검색 필터링
      if (search.trim()) {
        const searchLower = search.toLowerCase()
        logs = logs.filter((log) => {
          const admin = db.users.findById(log.adminId)
          const targetUser = log.targetUserId ? db.users.findById(log.targetUserId) : null

          return (
            admin?.name?.toLowerCase().includes(searchLower) ||
            targetUser?.name?.toLowerCase().includes(searchLower) ||
            log.action?.toLowerCase().includes(searchLower)
          )
        })
      }

      // 최신순 정렬
      logs = logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // 페이지네이션
      const total = logs.length
      const totalPages = Math.ceil(total / limit)
      const startIndex = (page - 1) * limit
      const paginatedLogs = logs.slice(startIndex, startIndex + limit)

      const formattedLogs = paginatedLogs.map((log) => {
        const admin = db.users.findById(log.adminId)
        const targetUser = log.targetUserId ? db.users.findById(log.targetUserId) : null

        return {
          id: log.id,
          adminName: admin?.name || 'Unknown',
          action: log.action,
          targetName: targetUser?.name || 'N/A',
          targetType: log.targetType,
          timestamp: log.createdAt,
          reason: log.reason,
          details: log.details,
        }
      })

      return HttpResponse.json({
        status: 'success',
        data: {
          logs: formattedLogs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      })
    } catch (error) {
      console.error('[MSW] 관리 로그 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 시스템 설정 조회
  http.get('/api/admin/settings', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      // Mock 설정 데이터
      const settings = {
        appName: 'EduVerse',
        appDescription: 'EduVerse - 프로그래밍 교육 통합 플랫폼',
        smtpServer: 'smtp.gmail.com',
        senderEmail: 'noreply@eduverse.com',
        senderName: 'EduVerse Admin',
        maxUploadSize: 10, // MB
        sessionTimeout: 30, // minutes
        passwordExpiry: 90, // days
        maintenanceMode: false,
        emailNotifications: true,
      }

      return HttpResponse.json({
        status: 'success',
        data: { settings },
      })
    } catch (error) {
      console.error('[MSW] 시스템 설정 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 시스템 설정 업데이트
  http.put('/api/admin/settings', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const adminId = parseInt(token.split('-').pop() || '0')
      const admin = db.users.findById(adminId)

      if (!admin || admin.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const body = await request.json() as any

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId,
        action: 'change_user_status', // 또는 'update_system_settings'
        targetUserId: null,
        targetType: 'system',
        targetId: 0,
        reason: null,
        details: JSON.stringify({
          type: 'system_settings_update',
          settings: Object.keys(body),
        }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '시스템 설정이 저장되었습니다.',
        data: {
          settings: body,
          logCreated: true,
        },
      })
    } catch (error) {
      console.error('[MSW] 시스템 설정 업데이트 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 통계 & 분석 데이터 조회
  http.get('/api/admin/analytics', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      // 쿼리 파라미터 추출
      const url = new URL(request.url)
      const dateRange = url.searchParams.get('dateRange') || '30d'

      // 모든 사용자와 수업 데이터
      const allUsers = db.users.findAll()
      const allClasses = db.classes.findAll()

      // 사용자 통계
      const userStats = {
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter((u) => u.role === 'student').length,
        totalProfessors: allUsers.filter((u) => u.role === 'professor').length,
        totalAdmins: allUsers.filter((u) => u.role === 'admin').length,
        activeUsers: allUsers.filter((u) => u.status === 'active').length,
        inactiveUsers: allUsers.filter((u) => u.status === 'inactive').length,
        suspendedUsers: allUsers.filter((u) => u.status === 'suspended').length,
      }

      // 역할별 분포
      const roleDistribution = [
        {
          role: '학생',
          count: userStats.totalStudents,
          percentage: Math.round((userStats.totalStudents / userStats.totalUsers) * 100) || 0,
        },
        {
          role: '교수',
          count: userStats.totalProfessors,
          percentage: Math.round((userStats.totalProfessors / userStats.totalUsers) * 100) || 0,
        },
        {
          role: '관리자',
          count: userStats.totalAdmins,
          percentage: Math.round((userStats.totalAdmins / userStats.totalUsers) * 100) || 0,
        },
      ]

      // 수업 통계
      const enrollments = db.enrollments.findAll()
      const classStats = {
        totalClasses: allClasses.length,
        activeClasses: allClasses.filter((c) => c.deletedAt === null).length,
        archiveClasses: allClasses.filter((c) => c.deletedAt !== null).length,
        averageStudentsPerClass: Math.round(enrollments.length / Math.max(1, allClasses.length)),
        totalEnrollments: enrollments.length,
      }

      // 사용자 증가 추이 (최근 10개 데이터 포인트)
      const userGrowthData = []
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - 30)

      for (let i = 0; i < 10; i++) {
        const currentDate = new Date(baseDate)
        currentDate.setDate(currentDate.getDate() + i * 3)

        const dateStr = currentDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
        const newUsers = Math.floor(Math.random() * 25) + 5
        const totalUsers = 150 + i * 15 + Math.floor(Math.random() * 10)

        userGrowthData.push({
          date: dateStr,
          newUsers,
          totalUsers,
        })
      }

      // 주간 활동 데이터
      const weeklyActivity = [
        { day: '월', students: Math.floor(Math.random() * 100) + 100, professors: Math.floor(Math.random() * 30) + 20 },
        { day: '화', students: Math.floor(Math.random() * 100) + 100, professors: Math.floor(Math.random() * 30) + 20 },
        { day: '수', students: Math.floor(Math.random() * 100) + 100, professors: Math.floor(Math.random() * 30) + 20 },
        { day: '목', students: Math.floor(Math.random() * 100) + 100, professors: Math.floor(Math.random() * 30) + 20 },
        { day: '금', students: Math.floor(Math.random() * 100) + 100, professors: Math.floor(Math.random() * 30) + 20 },
        { day: '토', students: Math.floor(Math.random() * 50) + 30, professors: Math.floor(Math.random() * 15) + 5 },
        { day: '일', students: Math.floor(Math.random() * 50) + 30, professors: Math.floor(Math.random() * 15) + 5 },
      ]

      return HttpResponse.json({
        status: 'success',
        data: {
          userStats,
          roleDistribution,
          classStats,
          userGrowthData,
          weeklyActivity,
          dateRange,
        },
      })
    } catch (error) {
      console.error('[MSW] 통계 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 커리큘럼 목록 조회
  http.get('/api/admin/curriculums', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const url = new URL(request.url)
      const search = url.searchParams.get('search') || ''
      const language = url.searchParams.get('language') || ''

      let allCurriculums = db.curricula.findAll()

      // 검색 필터
      if (search) {
        const searchLower = search.toLowerCase()
        allCurriculums = allCurriculums.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower)
        )
      }

      // 언어 필터
      if (language) {
        allCurriculums = allCurriculums.filter((c) => c.language === language)
      }

      // 각 커리큘럼에 연결된 수업 개수 추가
      const curriculumsWithClassCount = allCurriculums.map((curriculum) => {
        const classesUsingCurriculum = db.classes
          .findAll()
          .filter((c) => c.curriculumId === curriculum.id).length

        return {
          ...curriculum,
          classCount: classesUsingCurriculum,
        }
      })

      return HttpResponse.json({
        status: 'success',
        data: {
          curriculums: curriculumsWithClassCount,
          total: curriculumsWithClassCount.length,
        },
      })
    } catch (error) {
      console.error('[MSW] 커리큘럼 목록 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 커리큘럼 상세 조회
  http.get('/api/admin/curriculums/:id', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const curriculumId = parseInt(params.id as string)
      const curriculum = db.curricula.findById(curriculumId)

      if (!curriculum) {
        return HttpResponse.json(
          { status: 'error', message: '커리큘럼을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 커리큘럼을 사용하는 수업 개수
      const classesUsingCurriculum = db.classes
        .findAll()
        .filter((c) => c.curriculumId === curriculumId).length

      return HttpResponse.json({
        status: 'success',
        data: {
          ...curriculum,
          classCount: classesUsingCurriculum,
        },
      })
    } catch (error) {
      console.error('[MSW] 커리큘럼 상세 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 커리큘럼 생성
  http.post('/api/admin/curriculums', async ({ request }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const body = await request.json() as any

      // 필수 필드 검증
      if (!body.name || !body.language || !body.weeks || !body.description) {
        return HttpResponse.json(
          { status: 'error', message: '필수 필드를 모두 입력해주세요.' },
          { status: 400 }
        )
      }

      // 같은 언어와 이름의 커리큘럼이 이미 존재하는지 확인
      const existingCurriculum = db.curricula
        .findByLanguage(body.language)
        .find((c) => c.name === body.name)

      if (existingCurriculum) {
        return HttpResponse.json(
          { status: 'error', message: '같은 언어와 이름의 커리큘럼이 이미 존재합니다.' },
          { status: 409 }
        )
      }

      // 커리큘럼 생성
      const newCurriculum = db.curricula.create({
        name: body.name,
        description: body.description,
        language: body.language,
        weeks: parseInt(body.weeks),
        status: body.status || 'active',
        createdAt: new Date().toISOString(),
      })

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId: userId,
        action: 'create_curriculum',
        targetType: 'curriculum',
        targetId: newCurriculum.id,
        details: JSON.stringify({
          name: body.name,
          language: body.language,
          weeks: body.weeks,
        }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        data: newCurriculum,
        message: '커리큘럼이 생성되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 커리큘럼 생성 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 커리큘럼 수정
  http.patch('/api/admin/curriculums/:id', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const curriculumId = parseInt(params.id as string)
      const curriculum = db.curricula.findById(curriculumId)

      if (!curriculum) {
        return HttpResponse.json(
          { status: 'error', message: '커리큘럼을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const body = await request.json() as any

      // 필수 필드 검증
      if (!body.name || !body.description || !body.weeks) {
        return HttpResponse.json(
          { status: 'error', message: '필수 필드를 모두 입력해주세요.' },
          { status: 400 }
        )
      }

      // 커리큘럼 수정
      const updatedCurriculum = db.curricula.update(curriculumId, {
        name: body.name,
        description: body.description,
        weeks: parseInt(body.weeks),
        status: body.status,
      })

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId: userId,
        action: 'update_curriculum',
        targetType: 'curriculum',
        targetId: curriculumId,
        details: JSON.stringify({
          name: body.name,
          weeks: body.weeks,
        }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        data: updatedCurriculum,
        message: '커리큘럼이 수정되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 커리큘럼 수정 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 커리큘럼 삭제
  http.delete('/api/admin/curriculums/:id', async ({ request, params }) => {
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

      if (!user || user.role !== 'admin') {
        return HttpResponse.json(
          { status: 'error', message: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const curriculumId = parseInt(params.id as string)
      const curriculum = db.curricula.findById(curriculumId)

      if (!curriculum) {
        return HttpResponse.json(
          { status: 'error', message: '커리큘럼을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 이 커리큘럼을 사용하는 수업이 있는지 확인
      const classesUsingCurriculum = db.classes
        .findAll()
        .filter((c) => c.curriculumId === curriculumId)

      if (classesUsingCurriculum.length > 0) {
        return HttpResponse.json(
          {
            status: 'error',
            message: `이 커리큘럼을 사용 중인 ${classesUsingCurriculum.length}개의 수업이 있습니다. 먼저 해당 수업들을 삭제해주세요.`,
          },
          { status: 409 }
        )
      }

      // 커리큘럼 삭제
      db.curricula.delete(curriculumId)

      // 관리자 로그 기록
      db.adminLogs.create({
        adminId: userId,
        action: 'delete_curriculum',
        targetType: 'curriculum',
        targetId: curriculumId,
        details: JSON.stringify({ name: curriculum.name }),
        createdAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '커리큘럼이 삭제되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 커리큘럼 삭제 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),
]
