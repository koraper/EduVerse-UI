import { http, HttpResponse } from 'msw'
import { db } from '../db/memory'

export const qnaHandlers = [
  // Get all questions for a student
  http.get('/api/student/qna', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const user = db.users.findByToken(token)

    if (!user || user.role !== 'student') {
      return HttpResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all questions for this student
    const questions = db.questions.findByStudentId(user.id)
    console.log('[QnA Handler] User ID:', user.id, 'Questions found:', questions.length)

    // 답변 내용 매핑
    const answerMap: Record<number, string> = {
      1: 'for문은 반복 횟수가 정해져 있을 때 사용하고, while문은 조건이 참인 동안 반복할 때 사용합니다. 예를 들어 리스트의 모든 요소를 순회할 때는 for문이, 사용자 입력을 받을 때까지 반복할 때는 while문이 적합합니다.',
      2: '네, 맞습니다. Python에서 함수에 return 문이 없으면 자동으로 None을 반환합니다. 명시적으로 return만 작성해도 None이 반환됩니다.',
      5: 'get() 메서드는 키가 없을 때 None을 반환하거나 기본값을 지정할 수 있지만, []를 사용하면 KeyError가 발생합니다. 따라서 키의 존재 여부가 불확실할 때는 get()을 사용하는 것이 안전합니다.',
      6: '재귀함수는 함수가 자기 자신을 호출하는 함수입니다. 예를 들어 팩토리얼을 구현하면:\n\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)\n\n이렇게 기저 조건(n <= 1)과 재귀 호출로 구성됩니다.',
    }

    // Transform to match QnA page interface
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      lessonId: q.weekNumber,
      lessonTitle: q.title,
      lessonWeek: q.weekNumber,
      studentId: q.studentId,
      studentName: user.name,
      question: q.content,
      answer: q.answered ? (answerMap[q.id] || '답변이 등록되었습니다.') : undefined,
      status: q.answered ? 'answered' as const : 'pending' as const,
      createdAt: q.createdAt,
      answeredAt: q.answered ? q.createdAt : undefined,
      answeredBy: q.answered ? '박교수' : undefined
    }))

    return HttpResponse.json({
      status: 'success',
      data: transformedQuestions
    })
  }),

  // Create a new question
  http.post('/api/student/qna', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const user = db.users.findByToken(token)

    if (!user || user.role !== 'student') {
      return HttpResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json() as { lessonId: number; question: string; classId?: number }

    if (!body.question?.trim()) {
      return HttpResponse.json(
        { status: 'error', message: 'Question is required' },
        { status: 400 }
      )
    }

    // Get lesson info for the question
    const lessonTitles: Record<number, string> = {
      1: '변수와 자료형',
      2: '조건문과 반복문',
      3: '함수의 이해',
      4: '리스트와 튜플',
      5: '딕셔너리와 집합',
      6: '클래스와 객체',
      7: '상속과 다형성',
      8: '모듈과 패키지'
    }

    const question = db.questions.create({
      studentId: user.id,
      classId: body.classId || 1,
      weekNumber: body.lessonId || 1,
      title: lessonTitles[body.lessonId || 1] || `${body.lessonId}차시`,
      content: body.question,
      priority: 'normal',
      answered: false,
      createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    })

    return HttpResponse.json({
      status: 'success',
      data: question
    })
  })
]
