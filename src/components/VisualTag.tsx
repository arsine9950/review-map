import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

interface VisualTagProps {
  label: string;     // 예: "맛"
  goodCount: number; // 좋아요 수
  badCount: number;  // 싫어요 수
}

const VisualTag = ({ label, goodCount, badCount }: VisualTagProps) => {
  const total = goodCount + badCount;
  
  // 비율 계산 (0~100)
  const badPercent = total === 0 ? 0 : (badCount / total) * 100;
  const goodPercent = total === 0 ? 0 : (goodCount / total) * 100;

  // 그라데이션 배경 생성 (중간에 흰색 완충지대를 둬서 깔끔하게)
  // 빨강(bad) -> 흰색 -> 파랑(good)
  const background = total === 0 
    ? '#f5f7fa' 
    : `linear-gradient(90deg, 
        rgba(255, 107, 107, 0.2) 0%, 
        rgba(255, 107, 107, 0.2) ${badPercent}%, 
        transparent ${badPercent}%, 
        transparent ${100 - goodPercent}%, 
        rgba(49, 130, 246, 0.2) ${100 - goodPercent}%, 
        rgba(49, 130, 246, 0.2) 100%)`;

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', maxWidth: '300px', height: '36px', 
      borderRadius: '12px', background: background,
      border: '1px solid #eee', padding: '0 10px',
      fontSize: '13px', fontWeight: 'bold', color: '#555',
      marginBottom: '8px'
    }}>
      
      {/* 왼쪽: 싫어요 숫자 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: badCount > 0 ? 1 : 0.3 }}>
        <FaThumbsDown color="#FF6B6B" size={12} />
        <span style={{ color: '#FF6B6B' }}>{badCount}</span>
      </div>

      {/* 중앙: 라벨 */}
      <span style={{ zIndex: 1 }}>{label}</span>

      {/* 오른쪽: 좋아요 숫자 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: goodCount > 0 ? 1 : 0.3 }}>
        <span style={{ color: '#3182F6' }}>{goodCount}</span>
        <FaThumbsUp color="#3182F6" size={12} />
      </div>

    </div>
  );
};

export default VisualTag;