import { apiClient } from '../apiClient';
import { Class, WeeklySession, WeeklySessionDetails } from '../../types/api/class';

/**
 * [교수] 본인이 생성한 수업 목록 조회
 */
export const getMyClasses = async (): Promise<Class[]> => {
  const response = await apiClient.get<{ classes: Class[] }>('/api/classes');
  return response.data.classes;
};

/**
 * [교수] 특정 수업의 주차별 세션 목록 조회
 * @param classId 수업 ID
 */
export const getWeeklySessions = async (classId: number): Promise<WeeklySession[]> => {
  const response = await apiClient.get<{ weeklySessions: WeeklySession[] }>(`/api/classes/${classId}/weeks`);
  return response.data.weeklySessions;
};

/**
 * [교수] 수업 생성
 * @param newClassData 생성할 수업 데이터
 */
export const createClass = async (newClassData: Omit<Class, 'id' | 'professorId' | 'invitationCode' | 'qrCodeUrl' | 'createdAt'>): Promise<Class> => {
  const response = await apiClient.post<{ class: Class }>('/api/classes', newClassData);
  return response.data.class;
};

/**
 * [교수] 주차별 수업 시작
 * @param classId 수업 ID
 * @param weekNumber 주차 번호
 */
export const startWeeklySession = async (classId: number, weekNumber: number): Promise<WeeklySession> => {
  const response = await apiClient.post<{ weeklySession: WeeklySession }>(`/api/classes/${classId}/weeks/${weekNumber}/start`);
  return response.data.weeklySession;
};

/**
 * [교수] 주차별 수업 종료
 * @param classId 수업 ID
 * @param weekNumber 주차 번호
 */
export const endWeeklySession = async (classId: number, weekNumber: number): Promise<WeeklySession> => {
  const response = await apiClient.post<{ weeklySession: WeeklySession }>(`/api/classes/${classId}/weeks/${weekNumber}/end`);
  return response.data.weeklySession;
};

/**
 * [교수] 수업 삭제
 * @param classId 수업 ID
 */
export const deleteClass = async (classId: number): Promise<void> => {
  await apiClient.delete(`/api/classes/${classId}`);
};

/**
 * [교수] 수업 정보 수정
 * @param classId 수정할 수업 ID
 * @param updatedData 수정할 데이터
 */
export const updateClass = async (classId: number, updatedData: Partial<Class>): Promise<Class> => {
  const response = await apiClient.put<{ class: Class }>(`/api/classes/${classId}`, updatedData);
  return response.data.class;
};

/**
 * [교수] 입장 코드 재발급
 * @param classId 수업 ID
 */
export const regenerateInvitationCode = async (classId: number): Promise<Class> => {
  const response = await apiClient.post<{ class: Class }>(`/api/classes/${classId}/invite-code/regenerate`);
  return response.data.class;
};

/**
 * [교수] 주차별 상세 정보 조회
 * @param classId 수업 ID
 * @param weekNumber 주차 번호
 */
export const getWeeklySessionDetails = async (classId: number, weekNumber: number): Promise<WeeklySessionDetails> => {
  const response = await apiClient.get<{ details: WeeklySessionDetails }>(`/api/classes/${classId}/weeks/${weekNumber}/details`);
  return response.data.details;
};
