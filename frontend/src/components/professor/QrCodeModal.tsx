// @ts-nocheck
import React from 'react';
import { Class } from '../../types/api/class';
import { toast } from 'react-toastify';

// --- 임시 컴포넌트 (실제로는 @components/common 등에서 가져와야 함) ---
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-xs relative text-center">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        {children}
      </div>
    </div>
  );
};
const Button = ({ children, onClick, disabled, className = '' }) => (
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded ${className}`}>
    {children}
  </button>
);
// --------------------------------------------------------------------

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, classData }) => {
  if (!classData) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.invitationCode);
    toast.success('입장 코드가 복사되었습니다.');
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    // QR 코드 API가 CORS를 지원하지 않을 수 있으므로, fetch 후 blob URL을 생성하는 것이 더 안정적입니다.
    // 여기서는 간단하게 구현합니다.
    link.href = classData.qrCodeUrl.replace('150x150', '300x300');
    link.download = `qrcode-${classData.name.replace(/\s/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('QR 코드를 다운로드합니다.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-2">{classData.name}</h2>
      <p className="text-sm text-gray-500 mb-4">학생 초대용 QR 코드</p>

      <div className="flex justify-center my-6">
        <img
          src={classData.qrCodeUrl.replace('150x150', '256x256')}
          alt="수업 참여 QR 코드"
          width={256}
          height={256}
        />
      </div>

      <div className="bg-gray-100 p-3 rounded-lg">
        <p className="text-sm text-gray-600">입장 코드</p>
        <p className="text-2xl font-bold tracking-widest my-1">{classData.invitationCode}</p>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleCopyCode} className="w-full bg-gray-200 text-gray-800">코드 복사</Button>
        <Button onClick={handleDownloadQr} className="w-full bg-indigo-600 text-white">다운로드</Button>
      </div>
    </Modal>
  );
};

export default QrCodeModal;
