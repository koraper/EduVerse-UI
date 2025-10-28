import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const profileHandlers = [
  // 프로필 조회
  http.get('/api/profile', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      // 토큰에서 사용자 ID 추출 (mock-jwt-token-{userId})
      const token = authHeader.replace('Bearer ', '')
      const userId = parseInt(token.split('-').pop() || '0')

      const user = db.users.findById(userId)

      if (!user) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const { password, ...userWithoutPassword } = user

      return HttpResponse.json({
        status: 'success',
        data: { user: userWithoutPassword },
      })
    } catch (error) {
      console.error('[MSW] 프로필 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 프로필 수정
  http.put('/api/profile', async ({ request }) => {
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

      if (!user) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 이메일 중복 체크 (다른 사용자가 사용 중인지)
      if (body.email && body.email !== user.email) {
        const existingUser = db.users.findByEmail(body.email)
        if (existingUser) {
          return HttpResponse.json(
            { status: 'error', message: '이미 사용 중인 이메일입니다.' },
            { status: 409 }
          )
        }
      }

      // 프로필 업데이트 (모든 필드 지원)
      const updatedUser = db.users.update(userId, {
        name: body.name || user.name,
        email: body.email || user.email,
        phone: body.phone !== undefined ? body.phone : user.phone,
        department: body.department !== undefined ? body.department : user.department,
        bio: body.bio !== undefined ? body.bio : user.bio,
        studentId: body.studentId !== undefined ? body.studentId : user.studentId,
        updatedAt: new Date().toISOString(),
      })

      const { password, ...userWithoutPassword } = updatedUser

      return HttpResponse.json({
        status: 'success',
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: { user: userWithoutPassword },
      })
    } catch (error) {
      console.error('[MSW] 프로필 수정 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 비밀번호 변경
  http.put('/api/profile/password', async ({ request }) => {
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

      if (!user) {
        return HttpResponse.json(
          { status: 'error', message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 현재 비밀번호 확인
      if (user.password !== body.currentPassword) {
        return HttpResponse.json(
          { status: 'error', message: '현재 비밀번호가 일치하지 않습니다.' },
          { status: 400 }
        )
      }

      // 비밀번호 업데이트
      db.users.update(userId, {
        password: body.newPassword,
        updatedAt: new Date().toISOString(),
      })

      return HttpResponse.json({
        status: 'success',
        message: '비밀번호가 성공적으로 변경되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 비밀번호 변경 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 알림 설정 조회
  http.get('/api/profile/notifications', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      // Mock 알림 설정 반환
      return HttpResponse.json({
        status: 'success',
        data: {
          emailNotifications: true,
          assignmentReminders: true,
          gradeNotifications: true,
          courseUpdates: true,
          weeklyDigest: false,
        },
      })
    } catch (error) {
      console.error('[MSW] 알림 설정 조회 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),

  // 알림 설정 수정
  http.put('/api/profile/notifications', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { status: 'error', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const body = await request.json() as any

      // Mock: 설정 저장 (실제로는 DB에 저장)
      console.log('[MSW] 알림 설정 저장:', body)

      return HttpResponse.json({
        status: 'success',
        message: '알림 설정이 저장되었습니다.',
        data: body,
      })
    } catch (error) {
      console.error('[MSW] 알림 설정 수정 에러:', error)
      return HttpResponse.json(
        { status: 'error', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }),
]
