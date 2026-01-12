import { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

interface TransformerInputProps {
  label: string; 
  value: 'good' | 'bad' | null;
  onChange: (val: 'good' | 'bad' | null) => void;
}

const TransformerInput = ({ label, value, onChange }: TransformerInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 선택 상태에 따른 스타일 (null이면 기본 회색)
  const getButtonStyle = () => {
    if (value === 'good') return { background: '#E3F2FD', color: '#3182F6', border: '1px solid #3182F6' };
    if (value === 'bad') return { background: '#FFEBEE', color: '#FF6B6B', border: '1px solid #FF6B6B' };
    return { background: '#f5f7fa', color: '#666', border: '1px solid transparent' };
  };

  const style = getButtonStyle();

  return (
    <div 
      style={{ 
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: '40px', borderRadius: '20px', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        overflow: 'hidden', cursor: 'pointer', ...style,
        width: isExpanded ? '140px' : '70px', // 확장 애니메이션
        boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
      }}
      // 마우스 오버/클릭 시 확장
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(true)}
    >
      
      {/* 👎 싫어요 버튼 */}
      <div 
        onClick={(e) => { 
          e.stopPropagation(); 
          // ✅ [핵심] 이미 'bad'라면 null(취소), 아니면 'bad' 선택
          onChange(value === 'bad' ? null : 'bad'); 
        }}
        style={{ 
          position: 'absolute', left: 0, width: '40px', height: '100%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s',
          cursor: 'pointer'
        }}
      >
        <FaThumbsDown color={value === 'bad' ? '#FF6B6B' : '#ccc'} size={14} />
      </div>

      {/* 중앙 텍스트 */}
      <span style={{ fontWeight: 'bold', fontSize: '13px', zIndex: 1, pointerEvents: 'none' }}>
        {label}
      </span>

      {/* 👍 좋아요 버튼 */}
      <div 
        onClick={(e) => { 
          e.stopPropagation(); 
          // ✅ [핵심] 이미 'good'이라면 null(취소), 아니면 'good' 선택
          onChange(value === 'good' ? null : 'good'); 
        }}
        style={{ 
          position: 'absolute', right: 0, width: '40px', height: '100%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s',
          cursor: 'pointer'
        }}
      >
        <FaThumbsUp color={value === 'good' ? '#3182F6' : '#ccc'} size={14} />
      </div>

    </div>
  );
};

export default TransformerInput;