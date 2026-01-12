import { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface NameInputModalProps {
  address: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const NameInputModal = ({ address, onClose, onSubmit }: NameInputModalProps) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    // 빈 값이어도 확인을 누르면 그냥 진행 (App.tsx에서 빈 값일 경우 주소로 대체 처리됨)
    onSubmit(name);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%', maxWidth: '320px', background: 'white', borderRadius: '24px',
        padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', gap: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* 상단: 제목 및 주소 (중앙 정렬) */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>📍 장소 이름 입력</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <FaMapMarkerAlt /> {address}
          </p>
        </div>

        {/* 입력창 (파란 테두리 강조) */}
        <input 
          autoFocus
          type="text" 
          placeholder="예: 맛있는 빵집, 우리집"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            border: '2px solid #3182F6', fontSize: '16px', outline: 'none',
            boxSizing: 'border-box', background: '#fff', color: '#333',
            textAlign: 'center', fontWeight: 'bold'
          }}
        />

        {/* 버튼 영역 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
              background: '#f0f0f0', color: '#666', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button 
            onClick={handleSubmit}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
              background: '#3182F6', color: 'white', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            확인
          </button>
        </div>

      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default NameInputModal;