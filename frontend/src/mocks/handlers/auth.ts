// @ts-nocheck
import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const authHandlers = [
  // 회원가입
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as any
    console.log('[MSW] 회원가입 요청:', body)

    // 이메일 중복 체크
    const existing = db.users.findByEmail(body.email)
    if (existing) {
      return HttpResponse.json(
        {
          status: 'error',
          message: '이미 가입된 이메일입니다.',
        },
        { status: 409 }
      )
    }

    // 새 사용자 생성
    const newUser = db.users.create({
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role,
      status: 'active',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 비밀번호 제거 후 반환
    const { password, ...userWithoutPassword } = newUser

    return HttpResponse.json({
      status: 'success',
      message: '회원가입이 완료되었습니다.',
      data: {
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + newUser.id,
      },
    })
  }),

  // 이메일 인증번호 발송
  http.post('/api/auth/send-verification', async ({ request }) => {
    const body = await request.json()
    console.log('[MSW] 이메일 인증번호 발송:', body)

    return HttpResponse.json({
      status: 'success',
      message: '인증번호가 발송되었습니다.',
      data: {
        verificationCode: '123456', // 개발용 고정 코드
        expiresIn: 600, // 10분
      },
    })
  }),

  // 이메일 인증번호 확인
  http.post('/api/auth/verify-email', async ({ request }) => {
    const body = await request.json()
    console.log('[MSW] 이메일 인증번호 확인:', body)

    // 개발용: 123456은 항상 성공
    if (body.code === '123456') {
      return HttpResponse.json({
        status: 'success',
        message: '이메일 인증이 완료되었습니다.',
      })
    }

    return HttpResponse.json(
      {
        status: 'error',
        message: '인증번호가 일치하지 않습니다.',
      },
      { status: 400 }
    )
  }),

  // 로그인
  http.post('/api/auth/login', async ({ request }) => {
    try {
      const body = await request.json() as any
      console.log('[MSW] 로그인 요청:', body)

      const user = db.users.findByEmail(body.email)

      if (!user) {
        return HttpResponse.json(
          {
            status: 'error',
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
          },
          { status: 401 }
        )
      }

      // 비밀번호 확인
      if (user.password !== body.password) {
        return HttpResponse.json(
          {
            status: 'error',
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
          },
          { status: 401 }
        )
      }

      // 사용자 상태 확인 (정지된 사용자는 로그인 불가)
      if (user.status === 'suspended') {
        return HttpResponse.json(
          {
            status: 'error',
            message: '정지된 계정입니다. 관리자에게 문의하세요.',
          },
          { status: 403 }
        )
      }

      if (user.status === 'inactive') {
        return HttpResponse.json(
          {
            status: 'error',
            message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
          },
          { status: 403 }
        )
      }

      // 비밀번호 제거 후 반환
      const { password, ...userWithoutPassword } = user

      return HttpResponse.json({
        status: 'success',
        message: '로그인되었습니다.',
        data: {
          user: userWithoutPassword,
          token: 'mock-jwt-token-' + user.id,
        },
      })
    } catch (error) {
      console.error('[MSW] 로그인 핸들러 에러:', error)
      return HttpResponse.json(
        {
          status: 'error',
          message: '서버 오류가 발생했습니다.',
        },
        { status: 500 }
      )
    }
  }),

  // 로그아웃
  http.post('/api/auth/logout', () => {
    console.log('[MSW] 로그아웃 요청')

    return HttpResponse.json({
      status: 'success',
      message: '로그아웃되었습니다.',
    })
  }),

  // 현재 사용자 정보 조회
  http.get('/api/auth/me', () => {
    console.log('[MSW] 현재 사용자 정보 조회')

    // 개발용: 기본적으로 첫 번째 학생 반환
    const user = db.users.findById(1)
    if (user) {
      const { password, ...userWithoutPassword } = user
      return HttpResponse.json({
        status: 'success',
        data: {
          user: userWithoutPassword,
        },
      })
    }

    return HttpResponse.json(
      {
        status: 'error',
        message: '인증되지 않은 사용자입니다.',
      },
      { status: 401 }
    )
  }),

  // 비밀번호 확인
  http.post('/api/auth/verify-password', async ({ request }) => {
    try {
      const body = await request.json() as any
      const authHeader = request.headers.get('Authorization')
      console.log('[MSW] 비밀번호 확인 요청:', body)

      if (!authHeader) {
        return HttpResponse.json(
          {
            status: 'error',
            message: '인증되지 않은 사용자입니다.',
          },
          { status: 401 }
        )
      }

      // 토큰에서 사용자 ID 추출 (mock-jwt-token-{userId} 형식)
      const token = authHeader.replace('Bearer ', '')
      const userId = parseInt(token.split('-').pop() || '0')

      const user = db.users.findById(userId)

      if (!user) {
        return HttpResponse.json(
          {
            status: 'error',
            message: '사용자를 찾을 수 없습니다.',
          },
          { status: 404 }
        )
      }

      // 비밀번호 확인
      if (user.password !== body.password) {
        return HttpResponse.json(
          {
            status: 'error',
            message: '비밀번호가 일치하지 않습니다.',
          },
          { status: 401 }
        )
      }

      return HttpResponse.json({
        status: 'success',
        message: '비밀번호가 확인되었습니다.',
      })
    } catch (error) {
      console.error('[MSW] 비밀번호 확인 핸들러 에러:', error)
      return HttpResponse.json(
        {
          status: 'error',
          message: '서버 오류가 발생했습니다.',
        },
        { status: 500 }
      )
    }
  }),
]

