import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { Class, Curriculum } from '../../types/api/class';

// --- 임시 컴포넌트 (실제로는 @components/common 등에서 가져와야 함) ---
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
        {children}
      </div>
    </div>
  );
};
const Button = ({ children, onClick, disabled, className = '', type = 'button' }) => (
  <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded ${className}`}>
    {children}
  </button>
);
const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...props} ref={ref} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${error ? 'border-red-500' : 'border-gray-300'}`} />
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
));
const Select = React.forwardRef(({ label, error, children, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select {...props} ref={ref} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${error ? 'border-red-500' : 'border-gray-300'}`}>
      {children}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
));
// --------------------------------------------------------------------

type FormInputs = Omit<Class, 'id' | 'professorId' | 'invitationCode' | 'qrCodeUrl' | 'createdAt'>;

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FormInputs>) => void;
  isUpdating: boolean;
  classData: Class | null;
}

const getCurricula = async (): Promise<Curriculum[]> => {
  const response = await apiClient.get<{ curricula: Curriculum[] }>('/api/curricula');
  return response.data.curricula;
};

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, onSubmit, isUpdating, classData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();

  const { data: curricula = [], isLoading: isCurriculaLoading } = useQuery({
    queryKey: ['curricula'],
    queryFn: getCurricula,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && classData) {
      reset(classData);
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen, classData, reset]);

  const handleFormSubmit: SubmitHandler<FormInputs> = (data) => {
    const processedData = {
      ...data,
      curriculumId: Number(data.curriculumId),
    };
    onSubmit(processedData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-6">수업 정보 수정</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="수업명"
          {...register('name', { required: '수업명은 필수 항목입니다.' })}
          error={errors.name}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="연도"
            type="number"
            {...register('year', { required: '연도는 필수 항목입니다.', valueAsNumber: true })}
            error={errors.year}
          />
          <Select
            label="학기"
            {...register('semester', { required: '학기는 필수 항목입니다.' })}
            error={errors.semester}
          >
            <option value="1학기">1학기</option>
            <option value="2학기">2학기</option>
            <option value="여름학기">여름학기</option>
            <option value="겨울학기">겨울학기</option>
          </Select>
        </div>
        <Select
          label="커리큘럼"
          {...register('curriculumId', { required: '커리큘럼을 선택해주세요.' })}
          error={errors.curriculumId}
          disabled={isCurriculaLoading}
        >
          <option value="">{isCurriculaLoading ? '불러오는 중...' : '커리큘럼 선택'}</option>
          {curricula.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div className="flex justify-end gap-4 pt-4">
          <Button onClick={onClose} className="bg-gray-200 text-gray-800">취소</Button>
          <Button type="submit" disabled={isUpdating} className="bg-blue-500 text-white">
            {isUpdating ? '수정 중...' : '수업 수정'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditClassModal;
