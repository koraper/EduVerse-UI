import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WeeklySession } from '../../types/api/class';
import * as classService from '../../services/professor/classService';

// --- 임시 컴포넌트 (실제로는 @components/common 등에서 가져와야 함) ---
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        {children}
      </div>
    </div>
  );
};
const Spinner = () => <div>Loading...</div>;
const Badge = ({ children, className = '' }) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{children}</span>;
// --------------------------------------------------------------------

interface WeeklySessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WeeklySession | null;
}

const TaskTypeBadge = ({ type }: { type: 'reading' | 'coding' | 'quiz' }) => {
  const styles = {
    reading: 'bg-blue-100 text-blue-800',
    coding: 'bg-green-100 text-green-800',
    quiz: 'bg-yellow-100 text-yellow-800',
  };
  return <Badge className={styles[type]}>{type}</Badge>;
};

const WeeklySessionDetailsModal: React.FC<WeeklySessionDetailsModalProps> = ({ isOpen, onClose, session }) => {
  const { data: details, isLoading, error } = useQuery({
    queryKey: ['weeklySessionDetails', session?.classId, session?.weekNumber],
    queryFn: () => classService.getWeeklySessionDetails(session!.classId, session!.weekNumber),
    enabled: !!session && isOpen, // 세션 정보와 모달이 열렸을 때만 쿼리 실행
  });

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (error) return <p className="text-red-500">상세 정보를 불러오는 데 실패했습니다.</p>;
    if (!details) return null;

    return (
      <>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">학습 목표</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {details.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">주요 과제</h3>
          <ul className="space-y-2">
            {details.tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-gray-800">{task.title}</span>
                <TaskTypeBadge type={task.type} />
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {details ? (
        <h2 className="text-2xl font-bold mb-4">{details.title}</h2>
      ) : (
        <h2 className="text-2xl font-bold mb-4">{session?.weekNumber}주차 상세 정보</h2>
      )}
      {renderContent()}
    </Modal>
  );
};

export default WeeklySessionDetailsModal;
