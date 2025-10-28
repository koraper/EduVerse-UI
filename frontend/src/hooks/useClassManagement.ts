import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as classService from '../services/professor/classService';
import { Class, WeeklySession } from '../types/api/class';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export const useClassManagement = () => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // 쿼리: 내 수업 목록 조회
  const { data: myClasses = [], isLoading: isClassesLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: classService.getMyClasses,
  });

  // 쿼리: 선택된 수업의 주차별 세션 조회
  const { data: weeklySessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ['weeklySessions', selectedClassId],
    queryFn: () => classService.getWeeklySessions(selectedClassId!),
    enabled: !!selectedClassId, // selectedClassId가 있을 때만 쿼리 실행
  });

  // 뮤테이션 성공 시 쿼리 무효화 (데이터 리프레시)
  const onMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['myClasses'] });
    if (selectedClassId) {
      queryClient.invalidateQueries({ queryKey: ['weeklySessions', selectedClassId] });
    }
  };

  // 뮤테이션: 수업 생성
  const { mutate: createClass, isPending: isCreating } = useMutation({
    mutationFn: (newClassData: Omit<Class, 'id' | 'professorId' | 'invitationCode' | 'qrCodeUrl' | 'createdAt'>) => classService.createClass(newClassData),
    onSuccess: (data, variables) => {
      toast.success(`'${variables.name}' 수업이 성공적으로 생성되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['myClasses'] });
    },
    onError: (error) => {
      // Axios 에러인 경우 서버에서 보낸 메시지를 사용, 그렇지 않으면 일반 메시지 사용
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : '수업 생성 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  // 뮤테이션: 수업 수정
  const { mutate: updateClass, isPending: isUpdating } = useMutation({
    mutationFn: ({ classId, data }: { classId: number; data: Partial<Class> }) =>
      classService.updateClass(classId, data),
    onSuccess: (data) => {
      toast.success(`'${data.name}' 수업 정보가 수정되었습니다.`);
      onMutationSuccess();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : '수업 수정 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  // 뮤테이션: 주차별 수업 시작
  const { mutate: startSession, isPending: isStartingSession } = useMutation({
    mutationFn: ({ classId, weekNumber }: { classId: number; weekNumber: number }) =>
      classService.startWeeklySession(classId, weekNumber),
    onSuccess: (data, variables) => {
      toast.success(`${variables.weekNumber}주차 수업이 시작되었습니다.`);
      onMutationSuccess();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : '수업 시작 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  // 뮤테이션: 주차별 수업 종료
  const { mutate: endSession, isPending: isEndingSession } = useMutation({
    mutationFn: ({ classId, weekNumber }: { classId: number; weekNumber: number }) =>
      classService.endWeeklySession(classId, weekNumber),
    onSuccess: (data, variables) => {
      toast.success(`${variables.weekNumber}주차 수업이 종료되었습니다.`);
      onMutationSuccess();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : '수업 종료 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  // 뮤테이션: 수업 삭제
  const { mutate: deleteClass, isPending: isDeleting } = useMutation({
    mutationFn: (classId: number) => classService.deleteClass(classId),
    onSuccess: (data, variables) => {
      const deletedClass = myClasses.find(c => c.id === variables);
      toast.success(`'${deletedClass?.name || '수업'}'이(가) 삭제되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['myClasses'] });
      setSelectedClassId(null); // 삭제 후 선택 해제
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message ? error.response.data.message : '수업 삭제 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  // 뮤테이션: 입장 코드 재발급
  const { mutate: regenerateCode, isPending: isRegeneratingCode } = useMutation({
    mutationFn: (classId: number) => classService.regenerateInvitationCode(classId),
    onSuccess: (data) => {
      toast.success(`'${data.name}' 수업의 입장 코드가 재발급되었습니다.`);
      onMutationSuccess();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : '코드 재발급 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  return {
    myClasses,
    isClassesLoading,
    selectedClassId,
    setSelectedClassId,
    weeklySessions,
    isSessionsLoading,
    createClass, isCreating,
    updateClass, isUpdating,
    regenerateCode, isRegeneratingCode,
    startSession, isStartingSession,
    endSession, isEndingSession,
    deleteClass, isDeleting,
  };
};
