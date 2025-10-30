// @ts-nocheck
import { http, HttpResponse } from 'msw';
import { db } from '../../db/memory';

/**
 * 현재 로그인한 교수 ID를 가져옵니다. (목업용)
 * 실제 애플리케이션에서는 세션이나 인증 컨텍스트에서 가져와야 합니다.
 */
const getCurrentProfessorId = () => {
  // 'professor@eduverse.com' 계정의 ID는 3입니다. (seed.ts 기준)
  return 3;
};

/**
 * 새로운 입장 코드를 생성합니다.
 */
const EXCLUDED_CHARS = ['0', 'O', '1', 'I', 'L'];
const generateInvitationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const availableChars = chars.split('').filter(c => !EXCLUDED_CHARS.includes(c)).join('');
  const MAX_RETRIES = 10;

  for (let i = 0; i < MAX_RETRIES; i++) {
    let code = '';
    for (let j = 0; j < 6; j++) {
      code += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
    }
    // 목업 환경에서는 DB 중복 체크를 생략하거나 단순화할 수 있습니다.
    // 이 코드에서는 생성된 코드가 항상 고유하다고 가정합니다.
    return code;
  }

  throw new Error('입장 코드 생성에 실패했습니다.');
};

export const professorClassHandlers = [
  /**
   * [교수] 본인이 생성한 수업 목록 조회
   * GET /api/classes
   */
  http.get('/api/classes', () => {
    const professorId = getCurrentProfessorId();
    const allClasses = db.classes.findAll();
    const myClasses = allClasses.filter(c => c.professorId === professorId);

    return HttpResponse.json({
      status: 'success',
      data: {
        classes: myClasses,
      },
    });
  }),

  /**
   * [교수] 수업 생성
   * POST /api/classes
   */
  http.post('/api/classes', async ({ request }) => {
    const professorId = getCurrentProfessorId();
     
    const newClassData = (await request.json()) as any;

    const curriculum = db.curricula.findById(newClassData.curriculumId);
    if (!curriculum) {
      return HttpResponse.json(
        { status: 'fail', message: '존재하지 않는 커리큘큘럼입니다.' },
        { status: 404 },
      );
    }

    const invitationCode = generateInvitationCode();
    const newClass = db.classes.create({
      ...newClassData,
      professorId,
      invitationCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${invitationCode}`,
      createdAt: new Date().toISOString(),
    });

    // 12주차 세션 자동 생성
    for (let i = 1; i <= 12; i++) {
      db.weeklySessions.create({
        classId: newClass.id,
        weekNumber: i,
        status: 'not_started',
        startedAt: null,
        endedAt: null,
        autoEndAt: null,
      });
    }

    return HttpResponse.json(
      {
        status: 'success',
        data: {
          class: newClass,
        },
      },
      { status: 201 },
    );
  }),

  /**
   * [교수] 수업 정보 수정
   * PUT /api/classes/:id
   */
  http.put('/api/classes/:id', async ({ params, request }) => {
    const classId = Number(params.id);
     
    const updatedData = (await request.json()) as any;

    const existingClass = db.classes.findById(classId);
    if (!existingClass) {
      return HttpResponse.json({ status: 'fail', message: '수업을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatedClass = db.classes.update(classId, updatedData);

    return HttpResponse.json({
      status: 'success',
      data: {
        class: updatedClass!,
      },
    });
  }),

  /**
   * [교수] 수업 삭제
   * DELETE /api/classes/:id
   */
  http.delete('/api/classes/:id', ({ params }) => {
    const classId = Number(params.id);
    const deleted = db.classes.delete(classId);

    if (!deleted) {
      return HttpResponse.json({ status: 'fail', message: '수업을 찾을 수 없습니다.' }, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  /**
   * [교수] 주차별 수업 목록 조회
   * GET /api/classes/:id/weeks
   */
  http.get('/api/classes/:id/weeks', ({ params }) => {
    const classId = Number(params.id);
    const sessions = db.weeklySessions.findByClassId(classId);

    return HttpResponse.json({
      status: 'success',
      data: {
        weeklySessions: sessions,
      },
    });
  }),

  /**
   * [교수] 주차별 수업 시작
   * POST /api/classes/:id/weeks/:week/start
   */
  http.post('/api/classes/:id/weeks/:week/start', ({ params }) => {
    const classId = Number(params.id);
    const weekNumber = Number(params.week);

    // 다른 주차가 진행 중인지 확인 (동시 진행 제한)
    const inProgressSession = db.weeklySessions.findInProgressByClassId(classId);
    if (inProgressSession) {
      return HttpResponse.json(
        {
          status: 'fail',
          message: `${inProgressSession.weekNumber}주차 수업이 이미 진행 중입니다. 먼저 종료해주세요.`,
        },
        { status: 409 }, // Conflict
      );
    }

    const session = db.weeklySessions.findByClassAndWeek(classId, weekNumber);
    if (!session) {
      return HttpResponse.json({ status: 'fail', message: '해당 주차를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (session.status === 'ended') {
      return HttpResponse.json({ status: 'fail', message: '이미 종료된 수업은 다시 시작할 수 없습니다.' }, { status: 400 });
    }

    const now = new Date();
    const autoEndAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

    const updatedSession = db.weeklySessions.update(session.id, {
      status: 'in_progress',
      startedAt: now.toISOString(),
      autoEndAt: autoEndAt.toISOString(),
    });

    return HttpResponse.json({
      status: 'success',
      data: { weeklySession: updatedSession! },
    });
  }),

  /**
   * [교수] 주차별 수업 종료
   * POST /api/classes/:id/weeks/:week/end
   */
  http.post('/api/classes/:id/weeks/:week/end', ({ params }) => {
    const classId = Number(params.id);
    const weekNumber = Number(params.week);

    const session = db.weeklySessions.findByClassAndWeek(classId, weekNumber);
    if (!session || session.status !== 'in_progress') {
      return HttpResponse.json({ status: 'fail', message: '진행 중인 수업이 아닙니다.' }, { status: 400 });
    }

    const updatedSession = db.weeklySessions.update(session.id, {
      status: 'ended',
      endedAt: new Date().toISOString(),
    });

    return HttpResponse.json({
      status: 'success',
      data: { weeklySession: updatedSession! },
    });
  }),
];
