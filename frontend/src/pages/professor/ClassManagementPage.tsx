import React, { useState } from 'react';
import { useClassManagement } from '../../hooks/useClassManagement';
import { Class, WeeklySession } from '../../types/api/class';
import CreateClassModal from '../../components/professor/CreateClassModal';
import EditClassModal from '../../components/professor/EditClassModal';
import QrCodeModal from '../../components/professor/QrCodeModal';
import WeeklySessionDetailsModal from '../../components/professor/WeeklySessionDetailsModal';
import { Omit } from 'react-hook-form';

// --- 임시 컴포넌트 (실제로는 @components/common 등에서 가져와야 함) ---
const Button = ({ children, onClick, disabled, className = '' }) => (
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded ${className}`}>
    {children}
  </button>
);
const Card = ({ children, className = '' }) => <div className={`border rounded-lg p-4 shadow ${className}`}>{children}</div>;
const Spinner = () => <div>Loading...</div>;
// --------------------------------------------------------------------

const ClassManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [qrCodeClass, setQrCodeClass] = useState<Class | null>(null);
  const [viewingSession, setViewingSession] = useState<WeeklySession | null>(null);

  const {
    myClasses,
    isClassesLoading,
    selectedClassId,
    setSelectedClassId,
    weeklySessions,
    isSessionsLoading,
    startSession,
    isStartingSession,
    endSession,
    isEndingSession,
    deleteClass,
    isDeleting,
    createClass,
    isCreating,
    updateClass,
    isUpdating,
    regenerateCode,
    isRegeneratingCode,
  } = useClassManagement();

  const handleCreateClass = (data: Omit<Class, 'id' | 'professorId' | 'invitationCode' | 'qrCodeUrl' | 'createdAt'>) => {
    createClass(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false); // 성공 시 모달 닫기
      },
    });
  };

  const handleUpdateClass = (data: Partial<Class>) => {
    if (editingClass) {
      updateClass({ classId: editingClass.id, data }, {
        onSuccess: () => {
          setEditingClass(null); // 성공 시 모달 닫기
        },
      });
    }
  };

  const handleStartSession = (weekNumber: number) => {
    if (selectedClassId) {
      startSession({ classId: selectedClassId, weekNumber });
    }
  };

  const handleEndSession = (weekNumber: number) => {
    if (selectedClassId) {
      endSession({ classId: selectedClassId, weekNumber });
    }
  };

  const renderSessionStatus = (session: WeeklySession) => {
    const isMutationPending = isStartingSession || isEndingSession;
    switch (session.status) {
      case 'not_started':
        return <Button onClick={() => handleStartSession(session.weekNumber)} disabled={isMutationPending} className="bg-blue-500 text-white">수업 시작</Button>;
      case 'in_progress':
        return <Button onClick={() => handleEndSession(session.weekNumber)} disabled={isMutationPending} className="bg-red-500 text-white">수업 종료</Button>;
      case 'ended':
        return <span className="text-gray-500">종료됨</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">수업 관리</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-500 text-white">새 수업 생성</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 왼쪽: 수업 목록 */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">내 수업 목록</h2>
          {isClassesLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              {myClasses.map((cls: Class) => (
                <Card
                  key={cls.id}
                  className={`cursor-pointer ${selectedClassId === cls.id ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-gray-400'}`}
                  onClick={() => setSelectedClassId(cls.id)}
                >
                  <h3 className="font-bold">{cls.name}</h3>
                  <p className="text-sm text-gray-600">{cls.year}년 {cls.semester}</p>
                  <p className="text-xs text-gray-500 mt-2">입장 코드: {cls.invitationCode}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    <Button onClick={(e) => { e.stopPropagation(); setQrCodeClass(cls); }} className="bg-indigo-100 text-indigo-800 text-xs col-span-full sm:col-span-1">
                      QR 코드
                    </Button>
                    <Button onClick={(e) => { e.stopPropagation(); setEditingClass(cls); }} className="bg-gray-200 text-xs">수정</Button>
                    <Button onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`'${cls.name}' 수업의 입장 코드를 재발급하시겠습니까?\n기존 코드는 더 이상 사용할 수 없습니다.`)) {
                        regenerateCode(cls.id);
                      }
                    }} className="bg-yellow-100 text-yellow-800 text-xs" disabled={isRegeneratingCode}>
                      {isRegeneratingCode && selectedClassId === cls.id ? '재발급 중...' : '코드 재발급'}
                    </Button>
                    <Button onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`'${cls.name}' 수업을 정말 삭제하시겠습니까?`)) {
                        deleteClass(cls.id);
                      }
                    }} className="bg-red-100 text-red-700 text-xs" disabled={isDeleting}>
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 주차별 세션 관리 */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">주차별 수업 관리</h2>
          {selectedClassId ? (
            isSessionsLoading ? (
              <Spinner />
            ) : (
              <Card>
                <ul className="space-y-3">
                  {weeklySessions.map((session: WeeklySession) => (
                    <li key={session.id} className="flex flex-wrap justify-between items-center p-3 border-b gap-2">
                      <div className="flex items-center">
                        <span className="font-medium">{session.weekNumber}주차</span>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          session.status === 'in_progress' ? 'bg-green-200 text-green-800' :
                          session.status === 'ended' ? 'bg-gray-200 text-gray-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => setViewingSession(session)} className="bg-gray-100 text-gray-700 text-xs">상세보기</Button>
                        {renderSessionStatus(session)}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          ) : (
            <Card className="flex items-center justify-center h-64 bg-gray-50">
              <p className="text-gray-500">왼쪽에서 관리할 수업을 선택하세요.</p>
            </Card>
          )}
        </div>
      </div>

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        isCreating={isCreating}
      />

      <EditClassModal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        onSubmit={handleUpdateClass}
        isUpdating={isUpdating}
        classData={editingClass}
      />

      <QrCodeModal
        isOpen={!!qrCodeClass}
        onClose={() => setQrCodeClass(null)}
        classData={qrCodeClass}
      />

      <WeeklySessionDetailsModal
        isOpen={!!viewingSession}
        onClose={() => setViewingSession(null)}
        session={viewingSession}
      />
    </div>
  );
};

export default ClassManagementPage;
